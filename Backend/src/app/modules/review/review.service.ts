import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { Product } from "../product/product.model.js";
import { Order } from "../order/order.model.js";
import { Review } from "./review.model.js";
import type { IReview } from "./review.interface.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";

const updateProductRating = async (productId: Types.ObjectId) => {
    const stats = await Review.aggregate([
        {
            $match: {
                product: new Types.ObjectId(productId),
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: "$product",
                avgRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    await Product.findByIdAndUpdate(productId, {
        ratings: Math.round((stats[0]?.avgRating || 0) * 10) / 10,
        reviewCount: stats[0]?.reviewCount || 0,
    });
};

const createReview = async (
    customerId: string,
    payload: { productId: string; orderId: string; rating: number; comment: string },
    files: any
) => {
    const order = await Order.findById(payload.orderId);
    if (!order) {
        throw new AppError(StatusCodes.NOT_FOUND, "Order not found");
    }

    if (order.customer.toString() !== customerId) {
        throw new AppError(StatusCodes.FORBIDDEN, "You can only review products you have ordered");
    }

    if (order.status !== "CONFIRMED") {
        throw new AppError(StatusCodes.BAD_REQUEST, "You can only review after order is confirmed");
    }

    if (order.paymentStatus !== "PAID") {
        throw new AppError(StatusCodes.BAD_REQUEST, "You can only review after payment is completed");
    }

    const hasProduct = order.items.some(
        (item) => item.product.toString() === payload.productId
    );
    if (!hasProduct) {
        throw new AppError(StatusCodes.BAD_REQUEST, "This product is not in your order");
    }

    const existing = await Review.findOne({
        product: new Types.ObjectId(payload.productId),
        customer: new Types.ObjectId(customerId),
        isDeleted: false,
    });
    if (existing) {
        throw new AppError(StatusCodes.BAD_REQUEST, "You have already reviewed this product");
    }

    const fileArray = files as Express.Multer.File[];
    const images = fileArray?.map((f) => f.path) || [];

    const review = await Review.create({
        product: new Types.ObjectId(payload.productId),
        customer: new Types.ObjectId(customerId),
        order: new Types.ObjectId(payload.orderId),
        rating: payload.rating,
        comment: payload.comment,
        images,
    });

    await updateProductRating(review.product);

    return review;
};

const getProductReviews = async (productId: string, query: Record<string, string>) => {
    const reviewQuery = new QueryBuilder(
        Review.find({ product: new Types.ObjectId(productId), isDeleted: false }),
        query
    )
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        reviewQuery.build().populate("customer", "name picture"),
        reviewQuery.getMeta(),
    ]);

    const breakdown = await Review.aggregate([
        {
            $match: {
                product: new Types.ObjectId(productId),
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: "$rating",
                count: { $sum: 1 },
            },
        },
    ]);

    const product = await Product.findById(productId);
    const avgRating = product?.ratings || 0;
    const totalReviews = product?.reviewCount || 0;

    return {
        data,
        meta,
        breakdown,
        avgRating,
        totalReviews,
    };
};

const updateReview = async (
    customerId: string,
    reviewId: string,
    payload: Partial<Pick<IReview, "rating" | "comment">>
) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new AppError(StatusCodes.NOT_FOUND, "Review not found");
    }

    if (review.customer.toString() !== customerId) {
        throw new AppError(StatusCodes.FORBIDDEN, "You do not have permission to update this review");
    }

    if (review.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Cannot update a deleted review");
    }

    const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { $set: payload },
        { new: true, runValidators: true }
    );

    if (updatedReview) {
        await updateProductRating(updatedReview.product);
    }

    return updatedReview;
};

const deleteReview = async (customerId: string, reviewId: string, role: string) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        throw new AppError(StatusCodes.NOT_FOUND, "Review not found");
    }

    if (role === "CUSTOMER" && review.customer.toString() !== customerId) {
        throw new AppError(StatusCodes.FORBIDDEN, "You do not have permission to delete this review");
    }

    await Review.findByIdAndUpdate(reviewId, { isDeleted: true });
    await updateProductRating(review.product);

    return null;
};

const getAllReviewsAdmin = async (query: Record<string, string>) => {
    const reviewQuery = new QueryBuilder(
        Review.find({ isDeleted: false }),
        query
    )
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        reviewQuery.build()
            .populate("product", "name images")
            .populate("customer", "name email picture"),
        reviewQuery.getMeta(),
    ]);

    return { data, meta };
};

const checkCanReview = async (customerId: string, productId: string) => {
    const order = await Order.findOne({
        customer: new Types.ObjectId(customerId),
        status: "CONFIRMED",
        paymentStatus: "PAID",
        "items.product": new Types.ObjectId(productId),
    } as any);

    if (!order) {
        return {
            canReview: false,
            reason: "You need to purchase and receive this product first",
        };
    }

    const existingReview = await Review.findOne({
        product: new Types.ObjectId(productId),
        customer: new Types.ObjectId(customerId),
        isDeleted: false,
    });

    if (existingReview) {
        return {
            canReview: false,
            reason: "You have already reviewed this product",
            reviewId: existingReview._id!.toString(),
        };
    }

    return {
        canReview: true,
        orderId: order._id!.toString(),
    };
};

export const ReviewServices = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getAllReviewsAdmin,
    checkCanReview,
};
