export interface ICartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    stock: number;
    shopId: string;
    vendorId: string;
}

export interface ICart {
    userId: string;
    items: ICartItem[];
    totalItems: number;
    totalPrice: number;
}
