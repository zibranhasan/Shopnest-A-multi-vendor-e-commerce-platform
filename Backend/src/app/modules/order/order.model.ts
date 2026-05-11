import { Schema, model } from "mongoose";
import { OrderStatus, PaymentStatus, type IOrder, type IOrderItem } from "./order.interface.js";

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        vendor: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        shop: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        _id: true,
    }
);

const orderSchema = new Schema<IOrder>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
        },
        couponCode: {
            type: String,
        },
        discount: {
            type: Number,
            default: 0,
        },
        subTotal: {
            type: Number,
            required: true,
            min: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.UNPAID,
        },
        transactionId: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Order = model<IOrder>("Order", orderSchema);
