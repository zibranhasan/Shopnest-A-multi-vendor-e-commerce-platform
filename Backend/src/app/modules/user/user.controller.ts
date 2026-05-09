import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { UserServices } from "./user.service.js";
import { sendResponse } from "../../utils/sendResponse.js";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "User Created Successfully",
        data: user,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await UserServices.getAllUsers(query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id as string;
    if (!id || Array.isArray(id)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid user id");

    const user = await UserServices.getUserById(id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Retrieved Successfully",
        data: user,
    });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserServices.updateUser(decodedToken.userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Profile Updated Successfully",
        data: user,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    await UserServices.deleteUser(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Deleted Successfully",
        data: null,
    });
});

const changeUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id as string;
    if (!id || Array.isArray(id)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid user id");

    const { role } = req.body;
    const user = await UserServices.changeUserRole(id, role);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Role Updated Successfully",
        data: user,
    });
});

const changeUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params?.id as string;
    if (!id || Array.isArray(id)) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid user id");

    const { isActive } = req.body;
    const user = await UserServices.changeUserStatus(id, isActive);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "User Status Updated Successfully",
        data: user,
    });
});

// Address
const addAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const user = await UserServices.addAddress(decodedToken.userId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Address Added Successfully",
        data: user,
    });
});

const updateAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const addressId = req.params.addressId as string;
    if (!addressId) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid address id");

    const user = await UserServices.updateAddress(decodedToken.userId, addressId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Address Updated Successfully",
        data: user,
    });
});

const deleteAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const addressId = req.params.addressId as string;
    if (!addressId) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid address id");

    const user = await UserServices.deleteAddress(decodedToken.userId, addressId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Address Deleted Successfully",
        data: user,
    });
});

// Wishlist
const addToWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const { productId } = req.body;
    if (!productId) throw new AppError(StatusCodes.BAD_REQUEST, "Product ID is required");

    const wishlist = await UserServices.addToWishlist(decodedToken.userId, productId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Added to Wishlist Successfully",
        data: wishlist,
    });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const productId = req.params.productId as string;
    if (!productId) throw new AppError(StatusCodes.BAD_REQUEST, "Product ID is required");

    const wishlist = await UserServices.removeFromWishlist(decodedToken.userId, productId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Removed from Wishlist Successfully",
        data: wishlist,
    });
});

const getWishlist = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const wishlist = await UserServices.getWishlist(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Wishlist Retrieved Successfully",
        data: wishlist,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    const profile = await UserServices.getMyProfile(decodedToken.userId);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Your profile Retrieved Successfully",
        data: profile,
    });
});

export const UserControllers = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    changeUserStatus,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    getMyProfile,
};
