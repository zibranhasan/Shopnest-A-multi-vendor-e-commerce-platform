import { z } from "zod";

const createReviewZodSchema = z.object({
    productId: z.string({ error: "Product ID is required" }),
    orderId: z.string({ error: "Order ID is required" }),
    rating: z.coerce.number({ error: "Rating is required" }).min(1).max(5),
    comment: z.string({ error: "Comment is required" }).min(10).max(500),
});

const updateReviewZodSchema = z.object({
    rating: z.coerce.number().min(1).max(5).optional(),
    comment: z.string().min(10).max(500).optional(),
});

export const ReviewValidations = {
    createReviewZodSchema,
    updateReviewZodSchema,
};
