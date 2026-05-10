import { Types } from "mongoose";

export enum ShopStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    REJECTED = "REJECTED",
}

export interface IShop {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
    vendor: Types.ObjectId; // ref → User
    status?: ShopStatus;
    address?: string;
    phone?: string;
    email?: string;
    isDeleted?: boolean;
    totalProducts?: number;
    totalSales?: number;
    totalRevenue?: number;
    rating?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
