// src/types/coupon.type.ts

export interface ICouponResponse {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    discount: number; // actual discount amount
    finalTotal: number; // total after discount
    minOrderAmount: number;
    maxDiscount: number;
}
