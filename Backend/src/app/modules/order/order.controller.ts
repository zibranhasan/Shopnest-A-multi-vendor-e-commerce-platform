import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { OrderServices } from "./order.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import type { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse.js";


const placeOrder = catchAsync(async (req, res) => {
    const customerId = (req.user as JwtPayload).userId;
    const result = await OrderServices.placeOrder(customerId, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Order placed successfully",
        data: result,
    });
});

const getMyOrders = catchAsync(async (req, res) => {
    const customerId = (req.user as JwtPayload).userId;
    const result = await OrderServices.getMyOrders(customerId, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getMyOrderById = catchAsync(async (req, res) => {
    const customerId = (req.user as JwtPayload).userId;
    const result = await OrderServices.getMyOrderById(customerId, req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order retrieved successfully",
        data: result,
    });
});

const cancelOrder = catchAsync(async (req, res) => {
    const customerId = (req.user as JwtPayload).userId;
    const result = await OrderServices.cancelOrder(customerId, req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order cancelled successfully",
        data: result,
    });
});

const getAllOrdersAdmin = catchAsync(async (req, res) => {
    const result = await OrderServices.getAllOrdersAdmin(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All orders retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getOrderByIdAdmin = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderByIdAdmin(req.params.id as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order retrieved successfully",
        data: result,
    });
});

export const OrderControllers = {
    placeOrder,
    getMyOrders,
    getMyOrderById,
    cancelOrder,
    getAllOrdersAdmin,
    getOrderByIdAdmin,
};
