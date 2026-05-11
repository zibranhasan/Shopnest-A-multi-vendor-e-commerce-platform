import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { couponSearchableFields } from "./coupon.constant.js";
import { DiscountType, type ICoupon } from "./coupon.interface.js";
import { Coupon } from "./coupon.model.js";

const createCoupon = async (payload: ICoupon) => {
    const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });
    if (existing) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon code already exists");
    }

    const coupon = await Coupon.create({
        ...payload,
        code: payload.code.toUpperCase(),
    });

    return coupon;
};

const getAllCoupons = async (query: Record<string, string>) => {
    const couponQuery = new QueryBuilder(Coupon.find({ isDeleted: false }), query)
        .search(couponSearchableFields)
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([couponQuery.build(), couponQuery.getMeta()]);

    return { data, meta };
};

const getCouponById = async (couponId: string) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, "Coupon not found");
    }

    if (coupon.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon is deleted");
    }

    return coupon;
};

const updateCoupon = async (couponId: string, payload: Partial<ICoupon>) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, "Coupon not found");
    }

    if (coupon.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon is deleted");
    }

    if (payload.code) {
        const existing = await Coupon.findOne({
            code: payload.code.toUpperCase(),
            _id: { $ne: couponId },
        });
        if (existing) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Coupon code already exists");
        }
        payload.code = payload.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, payload, {
        new: true,
        runValidators: true,
    });

    return updatedCoupon;
};

const deleteCoupon = async (couponId: string) => {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, "Coupon not found");
    }

    if (coupon.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon already deleted");
    }

    await Coupon.findByIdAndUpdate(couponId, { isDeleted: true });

    return null;
};

const applyCoupon = async (code: string, cartTotal: number) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isDeleted: false,
    });

    if (!coupon) {
        throw new AppError(StatusCodes.NOT_FOUND, "Invalid coupon code");
    }

    if (!coupon.isActive) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon is not active");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usedCount! >= coupon.usageLimit) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon usage limit reached");
    }

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
        throw new AppError(StatusCodes.BAD_REQUEST, `Minimum order amount is ${coupon.minOrderAmount}`);
    }

    let discount = 0;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
        discount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else if (coupon.discountType === DiscountType.FIXED) {
        discount = coupon.discountValue;
        discount = Math.min(discount, cartTotal);
    }

    const finalTotal = cartTotal - discount;

    return {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        finalTotal,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
    };
};

export const CouponServices = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
};
