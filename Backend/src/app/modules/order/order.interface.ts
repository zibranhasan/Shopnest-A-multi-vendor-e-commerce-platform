import { Types } from "mongoose";

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
    UNPAID = "UNPAID",
    PAID = "PAID",
    FAILED = "FAILED",
}

export interface IOrderItem {
    product: Types.ObjectId;    // ref → Product
    vendor: Types.ObjectId;     // ref → User
    shop: Types.ObjectId;       // ref → Shop
    name: string;               // snapshot at order time
    image: string;              // snapshot at order time
    price: number;              // snapshot at order time
    quantity: number;
}

export interface IOrder {
    _id?: Types.ObjectId;
    customer: Types.ObjectId;   // ref → User
    items: IOrderItem[];
    couponCode?: string;
    discount?: number;          // default 0
    subTotal: number;           // total before discount
    totalAmount: number;        // total after discount
    status?: OrderStatus;       // default PENDING
    paymentStatus?: PaymentStatus; // default UNPAID
    transactionId?: string;     // SSLCommerz transaction id
    isDeleted?: boolean;        // default false
    createdAt?: Date;
    updatedAt?: Date;
}
