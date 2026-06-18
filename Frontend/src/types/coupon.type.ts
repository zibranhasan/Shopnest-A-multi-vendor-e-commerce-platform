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

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  isDeleted: boolean;
  createdAt: string;
}

