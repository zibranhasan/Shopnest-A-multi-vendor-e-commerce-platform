import { Types } from "mongoose";

export enum ProductStatus {
    ACTIVE = "ACTIVE",
    DRAFT = "DRAFT",
    OUT_OF_STOCK = "OUT_OF_STOCK",
}

export interface IVariant {
    size?: string;       // "S", "M", "L", "XL"
    color?: string;      // "Red", "Blue"
    stock: number;       // stock for this variant
    price?: number;      // different price per variant (optional)
}

export interface IProduct {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    images: string[];            // Cloudinary URLs
    shop: Types.ObjectId;        // ref → Shop
    category: Types.ObjectId;    // ref → Category
    vendor: Types.ObjectId;      // ref → User
    price: number;
    discountPrice?: number;
    discountPercent?: number;    // auto calculated
    stock: number;
    sold?: number;               // default 0
    variants?: IVariant[];
    ratings?: number;            // default 0
    reviewCount?: number;        // default 0
    tags?: string[];
    status?: ProductStatus;      // default DRAFT
    isDeleted?: boolean;         // default false
    createdAt?: Date;
    updatedAt?: Date;
}
