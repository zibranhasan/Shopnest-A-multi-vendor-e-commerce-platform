import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { Product } from "../product/product.model.js";
import { ProductStatus } from "../product/product.interface.js";
import { redisClient } from "../../config/redis.config.js";
import type { ICart, ICartItem } from "./cart.interface.js";
import { Types } from "mongoose";

const addToCart = async (userId: string, productId: string, quantity: number) => {
    if (quantity < 1) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Quantity must be at least 1");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    if (product.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Product is not available");
    }

    if (product.status !== ProductStatus.ACTIVE) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Product is not available");
    }

    if (quantity > product.stock) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient stock");
    }

    const cartKey = `cart:${userId}`;
    const existingQty = await redisClient.hGet(cartKey, productId);

    if (existingQty) {
        const newQty = Number(existingQty) + quantity;
        if (newQty > product.stock) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient stock");
        }
        await redisClient.hSet(cartKey, productId, String(newQty));
    } else {
        await redisClient.hSet(cartKey, productId, String(quantity));
    }

    // Set expiry to 7 days
    await redisClient.expire(cartKey, 7 * 24 * 60 * 60);

    return getCart(userId);
};

const getCart = async (userId: string): Promise<ICart> => {
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.hGetAll(cartKey);

    if (!cartData || Object.keys(cartData).length === 0) {
        return {
            userId,
            items: [],
            totalItems: 0,
            totalPrice: 0,
        };
    }

    const productIds = Object.keys(cartData);
    const products = await Product.find({
        _id: { $in: productIds },
    }).populate("shop", "name");

    const items: ICartItem[] = products.map((product) => {
        const productId = product._id.toString();
        const shopObj = product.shop as { _id: Types.ObjectId; name?: string } | null;
        return {
            productId,
            name: product.name,
            slug: product.slug,
            image: product.images[0] || "",   // ✅ fallback
            price: product.discountPrice || product.price,
            quantity: Number(cartData[productId]),
            stock: product.stock,
            shopId: shopObj?._id ? shopObj._id.toString() : "",
            vendorId: product.vendor.toString(),
            shopName: shopObj?.name || "Shopnest Merchant",
        };
    });


    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { userId, items, totalItems, totalPrice };
};

const updateQuantity = async (userId: string, productId: string, quantity: number) => {
    if (quantity < 1) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Quantity must be at least 1");
    }

    const cartKey = `cart:${userId}`;
    const existing = await redisClient.hGet(cartKey, productId);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, "Item not found in cart");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    if (quantity > product.stock) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Insufficient stock");
    }

    await redisClient.hSet(cartKey, productId, String(quantity));

    return getCart(userId);
};

const removeFromCart = async (userId: string, productId: string) => {
    const cartKey = `cart:${userId}`;
    const existing = await redisClient.hGet(cartKey, productId);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, "Item not found in cart");
    }

    await redisClient.hDel(cartKey, productId);

    return getCart(userId);
};

const clearCart = async (userId: string) => {
    const cartKey = `cart:${userId}`;
    await redisClient.del(cartKey);
    return null;
};

export const CartServices = {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart,
};
