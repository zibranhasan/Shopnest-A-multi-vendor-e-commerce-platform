import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError.js";
import { Category } from "./category.model.js";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { categorySearchableFields } from "./category.constant.js";
import type { ICategory } from "./category.interface.js";

const createCategory = async (payload: Partial<ICategory>, file: any) => {
    if (!payload.name) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category name is required");
    }

    const existing = await Category.findOne({ name: payload.name });
    if (existing) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category already exists");
    }

    const slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const image = file?.path;

    const category = await Category.create({ ...payload, slug, image });
    return category;
};

const getAllCategories = async (query: Record<string, string>) => {
    const categoryQuery = new QueryBuilder(
        Category.find({ isDeleted: false, isActive: true }),
        query
    )
        .search(categorySearchableFields)
        .filter()
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        categoryQuery.build(),
        categoryQuery.getMeta(),
    ]);

    return { data, meta };
};

const getCategoryBySlug = async (slug: string) => {
    const category = await Category.findOne({
        slug,
        isDeleted: false,
        isActive: true,
    });
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }
    return category;
};

const updateCategory = async (
    categoryId: string,
    payload: Partial<ICategory>,
    file: any
) => {
    const existing = await Category.findById(categoryId);
    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }
    if (existing.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category is deleted");
    }

    const image = file?.path;

    if (image && existing.image) {
        await deleteImageFromCLoudinary(existing.image);
    }

    const updateData: Partial<ICategory> = { ...payload };
    if (image) updateData.image = image;

    if (payload.name) {
        updateData.slug = payload.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        {
            new: true,
            runValidators: true,
        }
    );

    return updatedCategory;
};

const deleteCategory = async (categoryId: string) => {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }
    if (category.isDeleted) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category is already deleted");
    }

    await Category.findByIdAndUpdate(categoryId, { isDeleted: true });
    return null;
};

export const CategoryServices = {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};
