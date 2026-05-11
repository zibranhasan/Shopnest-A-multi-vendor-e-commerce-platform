import { z } from "zod";

// ✅ Fix — remove body wrapper
const placeOrderZodSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string({ error: "Product ID is required" }),
            quantity: z.number({ error: "Quantity is required" }).min(1),
        })
    ).min(1).optional(),   // ← optional because items come from Redis cart
    couponCode: z.string().optional(),
});

export const OrderValidations = {
    placeOrderZodSchema,
};
