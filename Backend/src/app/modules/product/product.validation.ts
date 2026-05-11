import { z } from "zod";
import { ProductStatus } from "./product.interface.js";

// ✅ Zod v4 syntax — use "error" instead of "required_error"
const createProductZodSchema = z.object({
    name: z.string({ error: "Name is required" }).min(3).max(100),
    description: z.string({ error: "Description is required" }).min(10),
    category: z.string({ error: "Category is required" }),
    price: z.coerce.number({ error: "Price is required" }).min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number({ error: "Stock is required" }).min(0),
    tags: z.array(z.string()).optional(),
    variants: z.array(z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.coerce.number().min(0),
        price: z.coerce.number().min(0).optional(),
    })).optional(),
});

const updateProductZodSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).optional(),
    category: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    discountPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    variants: z.array(z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.coerce.number().min(0),
        price: z.coerce.number().min(0).optional(),
    })).optional(),
});

const updateProductStatusZodSchema = z.object({
    status: z.nativeEnum(ProductStatus),
});

export const ProductValidations = {
    createProductZodSchema,
    updateProductZodSchema,
    updateProductStatusZodSchema,
};