import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ShopServices } from "./shop.service.js";

const createShop = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await ShopServices.createShop(user.userId, req.body, req.files);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Shop created successfully",
        data: result,
    });
});

const getMyShop = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await ShopServices.getMyShop(user.userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My shop retrieved successfully",
        data: result,
    });
});

const updateMyShop = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await ShopServices.updateMyShop(user.userId, req.body, req.files);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop updated successfully",
        data: result,
    });
});

const deleteMyShop = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    await ShopServices.deleteMyShop(user.userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop deleted successfully",
        data: null,
    });
});

const getAllShopsPublic = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopServices.getAllShopsPublic(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shops retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getShopBySlug = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopServices.getShopBySlug(req.params.slug as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop retrieved successfully",
        data: result,
    });
});

const getAllShopsAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopServices.getAllShopsAdmin(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All shops retrieved successfully (Admin)",
        data: result.data,
        meta: result.meta,
    });
});

const getShopByIdAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopServices.getShopByIdAdmin(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop retrieved successfully (Admin)",
        data: result,
    });
});

const updateShopStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await ShopServices.updateShopStatus(req.params.id as string, req.body.status);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop status updated successfully",
        data: result,
    });
});

export const ShopControllers = {
    createShop,
    getMyShop,
    updateMyShop,
    deleteMyShop,
    getAllShopsPublic,
    getShopBySlug,
    getAllShopsAdmin,
    getShopByIdAdmin,
    updateShopStatus,
};
