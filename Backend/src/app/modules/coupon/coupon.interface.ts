import { Types } from "mongoose";

export enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
}

export interface ICoupon {
    _id?: Types.ObjectId;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    expiryDate: Date;
    isActive?: boolean;
    usageLimit?: number;
    usedCount?: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
