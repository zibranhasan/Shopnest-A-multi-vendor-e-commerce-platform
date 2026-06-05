// src/types/cart.type.ts

export interface ICartItem {
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
    stock: number;
    shopId: string;
    vendorId: string;
    shopName?: string;
}

export interface ICart {
    userId: string;
    items: ICartItem[];
    totalItems: number;
    totalPrice: number;
}
