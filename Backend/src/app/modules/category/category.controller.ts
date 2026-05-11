import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CategoryServices } from "./category.service.js";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const result = await CategoryServices.createCategory(req.body, file);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.getAllCategories(
        req.query as Record<string, string>
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Categories retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryServices.getCategoryBySlug(
        req.params.slug as string
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Category retrieved successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const file = req.file;
    const id = req.params.id as string;
    const result = await CategoryServices.updateCategory(id, req.body, file);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await CategoryServices.deleteCategory(id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Category deleted successfully",
        data: null,
    });
});

export const CategoryControllers = {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};
