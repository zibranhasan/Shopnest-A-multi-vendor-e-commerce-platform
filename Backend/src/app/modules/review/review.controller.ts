import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ReviewServices } from "./review.service.js";
import type { JwtPayload } from "jsonwebtoken";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = (req.user as JwtPayload).userId;
    const files = req.files as Express.Multer.File[];
    const result = await ReviewServices.createReview(customerId, req.body, files);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Review created successfully",
        data: result,
    });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const result = await ReviewServices.getProductReviews(productId, req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product reviews retrieved successfully",
        data: result,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = (req.user as JwtPayload).userId;
    const reviewId = req.params.id as string;
    const result = await ReviewServices.updateReview(customerId, reviewId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = (req.user as JwtPayload).userId;
    const role = (req.user as JwtPayload).role;
    const reviewId = req.params.id as string;
    await ReviewServices.deleteReview(customerId, reviewId, role);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review deleted successfully",
        data: null,
    });
});

const getAllReviewsAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await ReviewServices.getAllReviewsAdmin(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All reviews retrieved successfully for admin",
        data: result.data,
        meta: result.meta,
    });
});

const checkCanReview = catchAsync(async (req: Request, res: Response) => {
    const customerId = (req.user as JwtPayload).userId;
    const productId = req.params.productId as string;
    const result = await ReviewServices.checkCanReview(customerId, productId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Review eligibility checked successfully",
        data: result,
    });
});

export const ReviewControllers = {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getAllReviewsAdmin,
    checkCanReview,
};
