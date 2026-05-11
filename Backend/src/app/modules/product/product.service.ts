import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError.js";
import { Category } from "../category/category.model.js";
import { Shop } from "../shop/shop.model.js";
import { Product } from "./product.model.js";
import { productSearchableFields } from "./product.constant.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config.js";
import { ProductStatus, type IProduct } from "./product.interface.js";
import { ShopStatus } from "../shop/shop.interface.js";

const createProduct = async (vendorId: string, payload: Partial<IProduct>, files: any) => {
    // find vendor's shop
    const shop = await Shop.findOne({ vendor: vendorId, isDeleted: false });
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found for this vendor");
    }

    if (shop.status !== ShopStatus.ACTIVE) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your shop is not active yet");
    }
    if (!payload.category) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category is required");
    }

    // find category by id
    const category = await Category.findOne({ _id: payload.category, isDeleted: false });
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found or is deleted");
    }

    // extract images from files
    const fileArray = files as Express.Multer.File[];
    const images = fileArray?.map(f => f.path) || [];

    if (images.length === 0) {
        throw new AppError(StatusCodes.BAD_REQUEST, "At least one image is required");
    }

    // generate slug from name
    const slug = payload.name!
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const productData = {
        ...payload,
        slug,
        images,
        shop: shop._id,
        vendor: vendorId,
    };

    const product = await Product.create(productData);

    // increment shop totalProducts
    await Shop.findByIdAndUpdate(shop._id, { $inc: { totalProducts: 1 } });

    return product;
};

const getMyProducts = async (vendorId: string, query: Record<string, string>) => {
    const shop = await Shop.findOne({ vendor: vendorId, isDeleted: false });
    if (!shop) {
        throw new AppError(StatusCodes.NOT_FOUND, "Shop not found");
    }

    const productQuery = new QueryBuilder(
        Product.find({ vendor: vendorId, isDeleted: false }),
        query
    )
        .search(productSearchableFields)
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        productQuery.build().populate("category", "name slug").populate("shop", "name slug"),
        productQuery.getMeta(),
    ]);

    return { data, meta };
};

const getProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug, isDeleted: false, status: ProductStatus.ACTIVE })
        .populate("category", "name slug")
        .populate("shop", "name slug logo")
        .populate("vendor", "name picture");

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    return product;
};

const getAllProductsPublic = async (query: Record<string, string>) => {
    const productQuery = new QueryBuilder(
        Product.find({ isDeleted: false, status: ProductStatus.ACTIVE }),
        query
    )
        .search(productSearchableFields)
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        productQuery.build().populate("category", "name slug").populate("shop", "name slug logo"),
        productQuery.getMeta(),
    ]);

    return { data, meta };
};

const updateProduct = async (vendorId: string, productId: string, payload: Partial<IProduct>, files: any) => {
    const product = await Product.findOne({ _id: productId, vendor: vendorId, isDeleted: false }).populate("shop");
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    // Typescript cast for shop status check
    const shop = product.shop as any;
    if (shop.status !== ShopStatus.ACTIVE) {
        throw new AppError(StatusCodes.FORBIDDEN, "Your shop is not active, cannot update product");
    }

    const updateData: Partial<IProduct> = { ...payload };

    // if new files provided
    const fileArray = files as Express.Multer.File[];
    const newImages = fileArray?.map(f => f.path) || [];

    if (newImages.length > 0) {
        // delete old images from cloudinary
        for (const img of product.images) {
            await deleteImageFromCLoudinary(img);
        }
        updateData.images = newImages;
    }

    if (payload.name) {
        updateData.slug = payload.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    if (payload.category) {
        const category = await Category.findOne({ _id: payload.category, isDeleted: false });
        if (!category) {
            throw new AppError(StatusCodes.NOT_FOUND, "Category not found or is deleted");
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedProduct;
};

const deleteProduct = async (vendorId: string, productId: string) => {
    const product = await Product.findOne({ _id: productId, vendor: vendorId, isDeleted: false });
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    await Product.findByIdAndUpdate(productId, { isDeleted: true });

    // decrement shop totalProducts
    await Shop.findByIdAndUpdate(product.shop, { $inc: { totalProducts: -1 } });

    return null;
};

const getAllProductsAdmin = async (query: Record<string, string>) => {
    const productQuery = new QueryBuilder(Product.find(), query)
        .search(productSearchableFields)
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        productQuery.build()
            .populate("category", "name")
            .populate("shop", "name status")
            .populate("vendor", "name email"),
        productQuery.getMeta(),
    ]);

    return { data, meta };
};

const updateProductStatus = async (productId: string, status: ProductStatus) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status },
        { new: true, runValidators: true }
    );

    return updatedProduct;
};

export const ProductServices = {
    createProduct,
    getMyProducts,
    getProductBySlug,
    getAllProductsPublic,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    updateProductStatus,
};
