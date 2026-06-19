import type { ComponentType } from "react";

// shared types
export interface IResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface ISidebarItem {
    title: string;
    items: {
        title: string;
        url: string;
        component: ComponentType;
    }[];
}

export type TRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

export * from "./cart.type";
export * from "./order.type";
export * from "./coupon.type";
export * from "./user.type";
export * from "./category.type";
export * from "./shop.type";
export * from "./product.type";
export * from "./review.type";