import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { Product } from "../product/product.model.js";
import { ProductStatus } from "../product/product.interface.js";
import { Coupon } from "../coupon/coupon.model.js";
import { Shop } from "../shop/shop.model.js";
import { CouponServices } from "../coupon/coupon.service.js";
import { redisClient } from "../../config/redis.config.js";
import { User } from "../user/user.model.js";

import { OrderStatus, PaymentStatus } from "./order.interface.js";
import { Order } from "./order.model.js";
import { orderSearchableFields } from "./order.constant.js";
import AppError from "../../errorHelpers/AppError.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";

const placeOrder = async (customerId: string,
    payload: {
        couponCode?: string;   // ← only this is needed
    }) => {
    // 1. get cart from Redis
    const cartData = await redisClient.hGetAll(`cart:${customerId}`);
    if (!cartData || Object.keys(cartData).length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Cart is empty");
    }

    // 2. fetch all products from cart
    const productIds = Object.keys(cartData);
    const products = await Product.find({
        _id: { $in: productIds },
        isDeleted: false,
        status: ProductStatus.ACTIVE,
    });

    if (products.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, "No active products found");
    }

    // 3. validate stock for each product
    for (const product of products) {
        const quantity = Number(cartData[product._id.toString()]);
        if (quantity > product.stock) {
            throw new AppError(StatusCodes.BAD_REQUEST, `Insufficient stock for ${product.name}`);
        }
    }

    // 4. build order items (snapshot pattern)
    const items = products.map((product) => ({
        product: product._id,
        vendor: product.vendor,
        shop: product.shop,
        name: product.name,
        image: product.images[0] || "",
        price: product.discountPrice || product.price,
        quantity: Number(cartData[product._id.toString()]),
    }));

    // 5. calculate subTotal
    const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 6. apply coupon if provided
    let discount = 0;
    let finalTotal = subTotal;
    if (payload.couponCode) {
        const couponResult = await CouponServices.applyCoupon(payload.couponCode, subTotal);
        discount = couponResult.discount;
        finalTotal = couponResult.finalTotal;
    }

    // 7. create order
    const order = await Order.create({
        customer: new Types.ObjectId(customerId),
        items,
        ...(payload.couponCode && { couponCode: payload.couponCode }),
        discount,
        subTotal,
        totalAmount: finalTotal,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
    });

    // 8. decrement stock for each product
    for (const product of products) {
        const quantity = Number(cartData[product._id.toString()]);
        await Product.findByIdAndUpdate(product._id, {
            $inc: {
                stock: -quantity,
                sold: +quantity,
            },
        });
    }

    // 9. increment coupon usedCount if coupon used
    if (payload.couponCode) {
        await Coupon.findOneAndUpdate(
            { code: payload.couponCode.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );
    }

    return order;
};

const getMyOrders = async (customerId: string, query: Record<string, any>) => {
    const orderQuery = new QueryBuilder(
        Order.find({
            customer: new Types.ObjectId(customerId),
            isDeleted: false,
        }),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await orderQuery.modelQuery
        .populate("items.product", "name images")
        .populate("items.shop", "name slug");
    const meta = await orderQuery.getMeta();

    return {
        meta,
        data: result,
    };
};

const getMyOrderById = async (customerId: string, orderId: string) => {
    const order = await Order.findOne({ _id: orderId, customer: new Types.ObjectId(customerId) })
        .populate("items.product", "name images slug")
        .populate("items.shop", "name slug logo")
        .populate("customer", "name email");

    if (!order) {
        throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    }

    return order;
};

const cancelOrder = async (customerId: string, orderId: string) => {
    const order = await Order.findOne({ _id: orderId, customer: new Types.ObjectId(customerId) });

    if (!order) {
        throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Only pending orders can be cancelled");
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Paid orders cannot be cancelled");
    }

    // update order status
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.FAILED,
        },
        { new: true }
    );

    // restore stock for each item
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stock: +item.quantity,
                sold: -item.quantity,
            },
        });
    }

    // decrement coupon usedCount if coupon was used
    if (order.couponCode) {
        await Coupon.findOneAndUpdate(
            { code: order.couponCode.toUpperCase() },
            { $inc: { usedCount: -1 } }
        );
    }

    return updatedOrder;
};

const getAllOrdersAdmin = async (query: Record<string, any>) => {
    // ── 1. Resolve customer name/email searchTerm → customer IDs ─────────
    const searchTerm: string | undefined = query.searchTerm;
    let customerIds: Types.ObjectId[] = [];

    if (searchTerm) {
        const matchingUsers = await User.find({
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ],
        }).select("_id");
        customerIds = matchingUsers.map((u) => u._id as Types.ObjectId);
    }

    // ── 2. Build base filter (excluding searchTerm — handled manually) ────
    const queryWithoutSearch = { ...query };
    delete queryWithoutSearch.searchTerm;

    // ── 3. Build the QueryBuilder pipeline ───────────────────────────────
    const orderQuery = new QueryBuilder(
        Order.find({ isDeleted: false }),
        queryWithoutSearch,
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    // Apply customer + transactionId + couponCode search manually
    if (searchTerm) {
        const searchConditions: Record<string, any>[] = [
            { transactionId: { $regex: searchTerm, $options: "i" } },
            { couponCode: { $regex: searchTerm, $options: "i" } },
        ];
        if (customerIds.length > 0) {
            searchConditions.push({ customer: { $in: customerIds } });
        }
        orderQuery.modelQuery = orderQuery.modelQuery.find({
            $or: searchConditions,
        });
    }

    const result = await orderQuery.modelQuery
        .populate("customer", "name email")
        .populate("items.shop", "name");

    const meta = await orderQuery.getMeta();

    // ── 4. Global statistics (never scoped to current page/filter) ────────
    const statsAgg = await Order.aggregate([
        { $match: { isDeleted: false } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: {
                    $sum: {
                        $cond: [
                            { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                            "$totalAmount",
                            0,
                        ],
                    },
                },
                paidOrders: {
                    $sum: {
                        $cond: [
                            { $eq: ["$paymentStatus", PaymentStatus.PAID] },
                            1,
                            0,
                        ],
                    },
                },
                pendingOrders: {
                    $sum: {
                        $cond: [
                            { $eq: ["$status", OrderStatus.PENDING] },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
    ]);

    const statistics = statsAgg[0]
        ? {
            totalOrders: statsAgg[0].totalOrders as number,
            totalRevenue: statsAgg[0].totalRevenue as number,
            paidOrders: statsAgg[0].paidOrders as number,
            pendingOrders: statsAgg[0].pendingOrders as number,
        }
        : { totalOrders: 0, totalRevenue: 0, paidOrders: 0, pendingOrders: 0 };

    return {
        meta,
        statistics,
        data: result,
    };
};

const getOrderByIdAdmin = async (orderId: string) => {
    const order = await Order.findById(orderId)
        .populate("customer", "name email phone")
        .populate("items.product", "name images")
        .populate("items.shop", "name slug logo")
        .populate("items.vendor", "name email");

    if (!order) {
        throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    }

    return order;
};

export const OrderServices = {
    placeOrder,
    getMyOrders,
    getMyOrderById,
    cancelOrder,
    getAllOrdersAdmin,
    getOrderByIdAdmin,
};
