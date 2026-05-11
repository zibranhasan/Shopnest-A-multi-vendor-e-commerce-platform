import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CartServices } from "./cart.service.js";
import type { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError.js";

const addToCart = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;
    const { productId, quantity } = req.body;

    if (!productId) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Product ID is required");
    }

    const qty = Number(quantity) || 1;
    const result = await CartServices.addToCart(userId, productId, qty);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Item added to cart successfully",
        data: result,
    });
});

const getCart = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;
    const result = await CartServices.getCart(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart retrieved successfully",
        data: result,
    });
});

const updateQuantity = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;
    const productId = req.params.productId as string;
    const { quantity } = req.body;

    const result = await CartServices.updateQuantity(userId, productId, Number(quantity));

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart quantity updated successfully",
        data: result,
    });
});

const removeFromCart = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;
    const productId = req.params.productId as string;

    const result = await CartServices.removeFromCart(userId, productId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Item removed from cart successfully",
        data: result,
    });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
    const userId = (req.user as JwtPayload).userId;

    const result = await CartServices.clearCart(userId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart cleared successfully",
        data: result,
    });
});

export const CartControllers = {
    addToCart,
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart,
};
