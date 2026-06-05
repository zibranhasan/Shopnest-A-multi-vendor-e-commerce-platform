// src/components/modules/cart/CartItem.tsx

import { Link } from "react-router";
import { Trash2, Store } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ICartItem } from "@/types/cart.type";
import QuantitySelector from "./QuantitySelector";
import {
    useUpdateCartQuantityMutation,
    useRemoveFromCartMutation,
} from "@/redux/features/cart/cart.api";

interface CartItemProps {
    item: ICartItem;
}

const FALLBACK_IMAGE = "https://placehold.co/150x150/f5f5f5/a3a3a3?text=No+Image";

export default function CartItem({ item }: CartItemProps) {
    const [updateQuantity, { isLoading: isUpdating }] = useUpdateCartQuantityMutation();
    const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();

    const handleIncrement = async () => {
        if (item.quantity >= item.stock) {
            toast.error(`Only ${item.stock} units available in stock`);
            return;
        }
        try {
            await updateQuantity({
                productId: item.productId,
                quantity: item.quantity + 1,
            }).unwrap();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update quantity");
        }
    };

    const handleDecrement = async () => {
        if (item.quantity <= 1) return;
        try {
            await updateQuantity({
                productId: item.productId,
                quantity: item.quantity - 1,
            }).unwrap();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update quantity");
        }
    };

    const handleRemove = async () => {
        try {
            await removeFromCart(item.productId).unwrap();
            toast.success("Item removed from cart");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove item");
        }
    };

    const itemSubtotal = item.price * item.quantity;

    return (
        <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
                
                {/* Product Image */}
                <Link
                    to={`/products/${item.slug}`}
                    className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden shrink-0 bg-muted border border-border/30 group"
                >
                    <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                    />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5 w-full text-center md:text-left">
                    <Link
                        to={`/products/${item.slug}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors duration-150 line-clamp-1 block leading-tight"
                    >
                        {item.name}
                    </Link>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-muted-foreground">
                        {/* Shop */}
                        <div className="flex items-center gap-1">
                            <Store className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="font-semibold text-foreground/80">{item.shopName || "Merchant"}</span>
                        </div>
                        <span className="hidden md:inline text-muted-foreground/40">•</span>
                        {/* Stock */}
                        <span>
                            {item.stock > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">In stock ({item.stock})</span>
                            ) : (
                                <span className="text-destructive font-semibold">Out of stock</span>
                            )}
                        </span>
                    </div>

                    <div className="text-sm font-semibold text-primary pt-1 md:hidden">
                        ৳{item.price.toLocaleString()} × {item.quantity}
                    </div>
                </div>

                {/* Controls & Subtotal */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border/40">
                    
                    {/* Quantity Selector */}
                    <QuantitySelector
                        quantity={item.quantity}
                        stock={item.stock}
                        isLoading={isUpdating}
                        onIncrement={handleIncrement}
                        onDecrement={handleDecrement}
                    />

                    {/* Price and Subtotal (Desktop only) */}
                    <div className="hidden md:block text-right min-w-24">
                        <div className="text-base font-extrabold text-foreground">
                            ৳{itemSubtotal.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium pt-0.5">
                            ৳{item.price.toLocaleString()} each
                        </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive hover:border-destructive/20 border border-transparent transition-all duration-200"
                        disabled={isRemoving}
                        onClick={handleRemove}
                        aria-label="Remove item"
                    >
                        <Trash2 className="h-4.5 w-4.5" />
                    </Button>

                </div>

            </CardContent>
        </Card>
    );
}
