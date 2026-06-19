import { Schema, model } from "mongoose";
import { type IReview } from "./review.interface.js";

const reviewSchema = new Schema<IReview>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 500,
        },
        images: {
            type: [String],
            default: [],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Unique compound index: one review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

export const Review = model<IReview>("Review", reviewSchema);
