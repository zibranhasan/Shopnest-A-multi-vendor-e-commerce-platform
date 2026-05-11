import { Types } from "mongoose";

export interface ICategory {
    _id?: Types.ObjectId;
    name: string;
    slug: string; // auto generated from name
    image?: string; // Cloudinary URL
    description?: string;
    isActive?: boolean; // default: true
    isDeleted?: boolean; // default: false
    createdAt?: Date;
    updatedAt?: Date;
}
