import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CouponServices } from "./coupon.service.js";
import AppError from "../../errorHelpers/AppError.js";

const createCoupon = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponServices.createCoupon(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Coupon created successfully",
        data: result,
    });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
    const result = await CouponServices.getAllCoupons(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Coupons retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCouponById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await CouponServices.getCouponById(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Coupon retrieved successfully",
        data: result,
    });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await CouponServices.updateCoupon(id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Coupon updated successfully",
        data: result,
    });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await CouponServices.deleteCoupon(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Coupon deleted successfully",
        data: null,
    });
});

const applyCoupon = catchAsync(async (req: Request, res: Response) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Coupon code is required");
    }

    const result = await CouponServices.applyCoupon(code, Number(cartTotal));

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Coupon applied successfully",
        data: result,
    });
});

export const CouponControllers = {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    applyCoupon,
};
