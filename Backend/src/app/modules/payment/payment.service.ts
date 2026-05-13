import mongoose from "mongoose";
import { Order } from "../order/order.model.js";
import { User } from "../user/user.model.js";
import { Product } from "../product/product.model.js";
import { Coupon } from "../coupon/coupon.model.js";
import { OrderStatus, PaymentStatus } from "../order/order.interface.js";
import { getTransactionId } from "../../utils/getTransactionId.js";
import { sslPaymentInit } from "./sslcommerz.service.js";
import { sendEmail } from "../../utils/sendEmail.js";
import AppError from "../../errorHelpers/AppError.js";

const initPayment = async (orderId: string, customerId: string) => {
    const order = await Order.findById(orderId);
    if (!order) {
        throw new AppError(404, "Order not found");
    }

    if (order.customer.toString() !== customerId) {
        throw new AppError(403, "You are not authorized to pay for this order");
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
        throw new AppError(400, "Order already paid");
    }

    if (order.status === OrderStatus.CANCELLED) {
        throw new AppError(400, "Order is cancelled");
    }

    const customer = await User.findById(customerId);
    if (!customer) {
        throw new AppError(404, "Customer not found");
    }

    const transactionId = getTransactionId();
    await Order.findByIdAndUpdate(orderId, { transactionId });

    const sslPayload = {
        amount: order.totalAmount,
        transactionId,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phone || "01700000000",
    };

    const sslPayment = await sslPaymentInit(sslPayload);

    if (sslPayment?.status !== "SUCCESS") {
        throw new AppError(400, sslPayment?.failedreason || "SSLCommerz initialization failed");
    }

    return { paymentUrl: sslPayment.GatewayPageURL };
};

const successPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { transactionId } = query;

        const order = (await Order.findOneAndUpdate(
            { transactionId } as any,
            {
                status: OrderStatus.CONFIRMED,
                paymentStatus: PaymentStatus.PAID,
            },
            { new: true, session }
        )
            .populate("customer", "name email phone")
            .populate("items.product", "name images")
            .populate("items.shop", "name")) as any;

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        const customer = order.customer as any;

        await sendEmail({
            to: customer.email,
            subject: "Order Confirmed - Shopnest",
            templateName: "orderConfirmation",
            templateData: {
                name: customer.name,
                orderId: order._id,
                items: order.items,
                totalAmount: order.totalAmount,
                transactionId: order.transactionId,
            },
        });

        await session.commitTransaction();
        await session.endSession();

        return { success: true, message: "Payment Completed Successfully" };
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
};

const failPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { transactionId } = query;

        const order = (await Order.findOneAndUpdate(
            { transactionId } as any,
            {
                status: OrderStatus.CANCELLED,
                paymentStatus: PaymentStatus.FAILED,
            },
            { new: true, session }
        )) as any;

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: { stock: item.quantity, sold: -item.quantity },
                },
                { session }
            );
        }

        // Restore coupon usage
        if (order.couponCode) {
            await Coupon.findOneAndUpdate(
                { code: order.couponCode },
                { $inc: { usedCount: -1 } },
                { session }
            );
        }

        await session.commitTransaction();
        await session.endSession();

        return { success: false, message: "Payment Failed" };
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
};

const cancelPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { transactionId } = query;

        const order = (await Order.findOneAndUpdate(
            { transactionId } as any,
            {
                status: OrderStatus.CANCELLED,
                paymentStatus: PaymentStatus.FAILED, // Or CANCELLED if you have it
            },
            { new: true, session }
        )) as any;

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: { stock: item.quantity, sold: -item.quantity },
                },
                { session }
            );
        }

        // Restore coupon usage
        if (order.couponCode) {
            await Coupon.findOneAndUpdate(
                { code: order.couponCode },
                { $inc: { usedCount: -1 } },
                { session }
            );
        }

        await session.commitTransaction();
        await session.endSession();

        return { success: false, message: "Payment Cancelled" };
    } catch (error: any) {
        await session.abortTransaction();
        await session.endSession();
        throw error;
    }
};

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
};
