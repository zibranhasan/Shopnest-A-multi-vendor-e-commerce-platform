// src/types/order.type.ts

export interface IOrderShop {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
}

export interface IOrderItem {
    product: string | { _id: string; name: string; images: string[]; slug?: string };
    vendor: string | { _id: string; name: string; email: string };
    shop: string | IOrderShop;
    name: string;
    image: string;
    price: number;
    quantity: number;
}

export interface IOrder {
    _id: string;
    customer: string | { _id: string; name: string; email: string; phone?: string };
    items: IOrderItem[];
    couponCode?: string;
    discount?: number;
    subTotal: number;
    totalAmount: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    paymentStatus: "UNPAID" | "PAID" | "FAILED";
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}
