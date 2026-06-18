// src/types/shop.type.ts

export enum ShopStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
    REJECTED = "REJECTED",
}

export interface IShopVendor {
    _id: string;
    name: string;
    picture?: string;
    email?: string;
}

export interface IShop {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
    vendor: IShopVendor;
    status?: ShopStatus;
    address?: string;
    phone?: string;
    email?: string;
    isDeleted?: boolean;
    totalProducts?: number;
    totalSales?: number;
    totalRevenue?: number;
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IShopMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IShopsResponse {
    data: IShop[];
    meta: IShopMeta;
}

export interface IAdminShop {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  totalProducts: number;
  totalSales: number;
  vendor: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  createdAt: string;
}

export interface IVendorShop {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  rating: number;
  vendor: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  createdAt: string;
}
