import { Types } from "mongoose";

export interface IReview {
    _id?: Types.ObjectId;
    product: Types.ObjectId;   // ref → Product
    customer: Types.ObjectId;  // ref → User
    order: Types.ObjectId;     // ref → Order
    rating: number;            // 1-5
    comment: string;           // min 10, max 500
    images?: string[];         // Cloudinary URLs (optional)
    isDeleted?: boolean;       // default false
    createdAt?: Date;
    updatedAt?: Date;
}
