// src/pages/cart/Cart.tsx

import { useState } from "react";
import { Link } from "react-router";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
    useGetCartQuery,
    useClearCartMutation,
} from "@/redux/features/cart/cart.api";
import { Button } from "@/components/ui/button";

import CartItem from "@/components/modules/cart/CartItem";
import CartSummary from "@/components/modules/cart/CartSummary";
import EmptyCart from "@/components/modules/cart/EmptyCart";
import CartSkeleton from "@/components/modules/cart/CartSkeleton";
import ClearCartDialog from "@/components/modules/cart/ClearCartDialog";
import type { ICartItem } from "@/types";


export default function Cart() {
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    const { data: userData, isLoading: isUserLoading } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    const {
        data: cartData,
        isLoading: isCartLoading,
        isError,
    } = useGetCartQuery(undefined, {
        skip: !isLoggedIn,
    });

    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

    const handleClearCart = async () => {
        try {
            await clearCart(undefined).unwrap();
            toast.success("Cart cleared successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to clear cart");
        }
    };

    // If loading profiles or cart
    if (isUserLoading || (isLoggedIn && isCartLoading)) {
        return <CartSkeleton />;
    }

    // If unauthenticated or no email
    if (!isLoggedIn) {
        return (
            <div className="max-w-md mx-auto my-20 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
                    <ShoppingBag className="h-9 w-9 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-foreground">
                        Please login to view your cart
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        We need you to log in to see your personalized shopping cart and proceed to checkout.
                    </p>
                </div>
                <Button asChild className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25">
                    <Link to={`/login?redirect=${encodeURIComponent("/cart")}`}>
                        Log In Now
                    </Link>
                </Button>
            </div>
        );
    }

    const cart = cartData?.data;
    const items = cart?.items || [];
    const totalItems = cart?.totalItems || 0;
    const totalPrice = cart?.totalPrice || 0;

    // Empty Cart state
    if (items.length === 0 || isError) {
        return <EmptyCart />;
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        Shopping Cart
                    </h1>
                    <p className="text-sm text-muted-foreground font-semibold">
                        You have <span className="text-primary font-bold">{totalItems}</span> item(s) in your cart
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Clear Cart Button Dialog */}
                    <ClearCartDialog
                        isLoading={isClearing}
                        onConfirm={handleClearCart}
                        open={clearDialogOpen}
                        onOpenChange={setClearDialogOpen}
                    />
                </div>
            </div>

            {/* Layout Columns */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                
                {/* Left: Cart items list (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="space-y-4">
                        {items.map((item: ICartItem) => (
                            <CartItem key={item.productId} item={item} />
                        ))}
                    </div>

                    {/* Bottom Utility buttons */}
                    <div className="flex justify-start pt-2">
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-xl gap-2 font-bold hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                            <Link to="/products">
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right: Summary panel (4 Cols) */}
                <div className="lg:col-span-4">
                    <CartSummary subtotal={totalPrice} />
                </div>

            </div>
        </main>
    );
}
