import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ProductServices } from "./product.service.js";
import type { JwtPayload } from "jsonwebtoken";


const createProduct = catchAsync(async (req: Request, res: Response) => {
    const vendorId = (req.user as JwtPayload).userId;
    const files = req.files as Express.Multer.File[];  // ✅
    const result = await ProductServices.createProduct(vendorId, req.body, files);

    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Product created successfully",
        data: result,
    });
});

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
    const vendorId = (req.user as JwtPayload).userId;
    const result = await ProductServices.getMyProducts(vendorId, req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug as string;

    const result = await ProductServices.getProductBySlug(slug);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});

const getAllProductsPublic = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductServices.getAllProductsPublic(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Products retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const vendorId = (req.user as JwtPayload).userId;
    const productId = req.params.id as string;  // ✅
    const files = req.files as Express.Multer.File[];  // ✅
    const result = await ProductServices.updateProduct(vendorId, productId, req.body, files);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product updated successfully",
        data: result,
    });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const vendorId = (req.user as JwtPayload).userId;
    const productId = req.params.id as string;  // ✅
    await ProductServices.deleteProduct(vendorId, productId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product deleted successfully",
        data: null,
    });
});

const getAllProductsAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductServices.getAllProductsAdmin(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "All products retrieved for admin",
        data: result.data,
        meta: result.meta,
    });
});

const updateProductStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;  // ✅
    const { status } = req.body;
    const result = await ProductServices.updateProductStatus(id, status);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product status updated successfully",
        data: result,
    });
});

export const ProductControllers = {
    createProduct,
    getMyProducts,
    getProductBySlug,
    getAllProductsPublic,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    updateProductStatus,
};
