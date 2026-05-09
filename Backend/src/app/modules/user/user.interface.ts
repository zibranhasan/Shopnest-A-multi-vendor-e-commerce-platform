import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    VENDOR = "VENDOR",
    CUSTOMER = "CUSTOMER",
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
    provider: "google" | "credentials";
    providerId: string;
}

export interface IAddress {
    label?: string;        // "Home", "Office"
    street: string;
    city: string;
    district: string;
    postalCode?: string;
    isDefault?: boolean;
}

export interface IUser {
    _id?: Types.ObjectId;

    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;

    role?: Role;
    isActive?: IsActive;
    isVerified?: boolean;
    isDeleted?: boolean;

    auths?: IAuthProvider[];

    // customer specific
    addresses?: IAddress[];
    wishlist?: Types.ObjectId[];   // ref → Product
    orders?: Types.ObjectId[];     // ref → Order

    // vendor specific
    shop?: Types.ObjectId;         // ref → Shop

    createdAt?: Date;
    updatedAt?: Date;
}