import { z } from "zod";
import { DiscountType } from "./coupon.interface.js";

const createCouponZodSchema = z.object({
    code: z.string({ error: "Coupon code is required" })
        .min(3, "Code must be at least 3 characters")
        .max(20, "Code must not exceed 20 characters")
        .transform((val) => val.toUpperCase()),
    discountType: z.nativeEnum(DiscountType, { error: "Discount type is required" }),
    discountValue: z.number({ error: "Discount value is required" }).min(0),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
    expiryDate: z.string({ error: "Expiry date is required" }),
    isActive: z.boolean().optional(),
    usageLimit: z.number().min(1).optional(),
});

const updateCouponZodSchema = z.object({
    code: z.string().min(3).max(20)
        .transform((val) => val.toUpperCase()).optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().min(0).optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscount: z.number().min(0).optional(),
    expiryDate: z.string().optional(),
    isActive: z.boolean().optional(),
    usageLimit: z.number().min(1).optional(),
});

const applyCouponZodSchema = z.object({
    code: z.string({ error: "Coupon code is required" }),
    cartTotal: z.number({ error: "Cart total is required" }).min(0),
});

export const CouponValidations = {
    createCouponZodSchema,
    updateCouponZodSchema,
    applyCouponZodSchema,
};
