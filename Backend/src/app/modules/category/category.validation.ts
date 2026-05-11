import { z } from "zod";

export const createCategoryZodSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(3, { message: "Name must be at least 3 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" }),
    description: z
        .string()
        .max(200, { message: "Description cannot exceed 200 characters" })
        .optional(),
});

export const updateCategoryZodSchema = z.object({
    name: z
        .string()
        .min(3, { message: "Name must be at least 3 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .optional(),
    description: z
        .string()
        .max(200, { message: "Description cannot exceed 200 characters" })
        .optional(),
    isActive: z.boolean().optional(),
});
