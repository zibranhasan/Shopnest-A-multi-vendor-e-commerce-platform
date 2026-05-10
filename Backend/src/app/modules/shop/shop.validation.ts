import { z } from "zod";
import { ShopStatus } from "./shop.interface.js";

export const createShopZodSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(3, { message: "Name must be at least 3 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" }),
    description: z
        .string()
        .max(500, { message: "Description cannot exceed 500 characters" })
        .optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }).optional(),
});

export const updateShopZodSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    description: z.string().max(500).optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
});

export const updateShopStatusZodSchema = z.object({
    status: z.enum(Object.values(ShopStatus) as [string, ...string[]]),
});
