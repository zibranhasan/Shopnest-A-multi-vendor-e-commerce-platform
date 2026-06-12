// src/types/user.type.ts

export interface IAddress {
  _id: string;
  label?: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  role: string;
  isActive: string;
  isVerified: boolean;
  isDeleted: boolean;
  addresses: IAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  role: string;
  isActive: string;
  isVerified: boolean;
  createdAt: string;
}

