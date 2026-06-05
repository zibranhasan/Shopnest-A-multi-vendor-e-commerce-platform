// src/types/product.type.ts

export type ProductStatus = "ACTIVE" | "DRAFT" | "OUT_OF_STOCK";

export interface IVariant {
    size?: string;
    color?: string;
    stock: number;
    price?: number;
}

export interface IProductCategory {
    _id: string;
    name: string;
    slug: string;
}

export interface IProductShop {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
}

export interface IProductVendor {
    _id: string;
    name: string;
    picture?: string;
}

export interface IProduct {
    _id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    shop: IProductShop;
    category: IProductCategory;
    vendor: IProductVendor;
    price: number;
    discountPrice?: number;
    discountPercent?: number;
    stock: number;
    sold?: number;
    variants?: IVariant[];
    ratings?: number;
    reviewCount?: number;
    tags?: string[];
    status?: ProductStatus;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
