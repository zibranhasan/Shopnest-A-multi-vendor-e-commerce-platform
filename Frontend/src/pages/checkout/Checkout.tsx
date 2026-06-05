// src/pages/checkout/Checkout.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, ArrowLeft, Tag, X, ShieldCheck, Loader2, Store } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useGetCartQuery } from "@/redux/features/cart/cart.api";
import { useApplyCouponMutation } from "@/redux/features/coupon/coupon.api";
import { usePlaceOrderMutation } from "@/redux/features/order/order.api";
import { useInitPaymentMutation } from "@/redux/features/payment/payment.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICartItem } from "@/types";

const FALLBACK_IMAGE = "https://placehold.co/150x150/f5f5f5/a3a3a3?text=No+Image";

export default function Checkout() {
    const navigate = useNavigate();

    // 1. Auth check
    const { data: userData, isLoading: isUserLoading } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    // 2. Get Cart
    const {
        data: cartResponse,
        isLoading: isCartLoading,
        isError: isCartError,
    } = useGetCartQuery(undefined, {
        skip: !isLoggedIn,
    });

    const cart = cartResponse?.data;
    const items = cart?.items || [];
    const totalPrice = cart?.totalPrice || 0;

    // Redirect to /cart if cart is empty (only when done loading and checked authentication)
    useEffect(() => {
        if (!isUserLoading && !isCartLoading) {
            if (!isLoggedIn) {
                toast.error("Please login to proceed to checkout");
                navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
            } else if (items.length === 0 || isCartError) {
                toast.error("Your cart is empty");
                navigate("/cart");
            }
        }
    }, [isUserLoading, isCartLoading, isLoggedIn, items.length, isCartError, navigate]);

    // 3. Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{
        code: string;
        discount: number;
        finalTotal: number;
    } | null>(null);
    const [couponError, setCouponError] = useState("");

    // Mutations
    const [applyCoupon, { isLoading: isApplyingCoupon }] = useApplyCouponMutation();
    const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
    const [initPayment, { isLoading: isInitializingPayment }] = useInitPaymentMutation();

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError("");

        if (!couponCode.trim()) {
            setCouponError("Please enter a coupon code");
            return;
        }

        const formattedCode = couponCode.toUpperCase().trim();

        try {
            const res = await applyCoupon({
                code: formattedCode,
                cartTotal: totalPrice,
            }).unwrap();

            if (res?.data) {
                setAppliedCoupon({
                    code: res.data.code,
                    discount: res.data.discount,
                    finalTotal: res.data.finalTotal,
                });
                toast.success(`Coupon ${formattedCode} applied successfully!`);
                setCouponCode("");
            } else {
                setCouponError("Invalid coupon response structure");
            }
        } catch (err: any) {
            const errorMsg = err?.data?.message || "Invalid coupon code";
            setCouponError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
        toast.info("Coupon removed");
    };

    // 4. Place Order & Pay Handler
    const isProcessing = isPlacingOrder || isInitializingPayment;

    const handlePlaceOrder = async () => {
        try {
            // Step 1: Place Order
            const orderRes = await placeOrder({
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            }).unwrap();

            const orderId = orderRes?.data?._id || orderRes?._id;

            if (!orderId) {
                throw new Error("Failed to retrieve order ID from response");
            }

            // Step 2 & 3: Init Payment
            const paymentRes = await initPayment(orderId).unwrap();
            const paymentUrl = paymentRes?.data?.paymentUrl || paymentRes?.paymentUrl;

            if (!paymentUrl) {
                throw new Error("Failed to retrieve payment URL");
            }

            toast.success("Order placed! Redirecting to payment gateway...");

            // Step 4: Redirect to external URL
            window.location.href = paymentUrl;
        } catch (err: any) {
            console.error("Checkout process failed:", err);
            toast.error(err?.data?.message || err?.message || "Something went wrong during checkout");
        }
    };

    // Calculate dynamic values
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : totalPrice;

    // Loading Skeletons
    if (isUserLoading || isCartLoading) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <div className="border-b border-border/40 pb-5 space-y-2">
                    <Skeleton className="h-10 w-48 rounded-xl" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-4">
                        <Skeleton className="h-32 w-full rounded-3xl" />
                        <Skeleton className="h-32 w-full rounded-3xl" />
                    </div>
                    <div className="lg:col-span-4">
                        <Skeleton className="h-96 w-full rounded-3xl" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        Checkout
                    </h1>
                    <p className="text-sm text-muted-foreground font-semibold">
                        Confirm your order details and proceed to payment
                    </p>
                </div>
            </div>

            {/* Layout Columns */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                
                {/* Left Column: Summary of items */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="space-y-4">
                        {items.map((item: ICartItem) => {
                            const itemSubtotal = item.price * item.quantity;
                            return (
                                <Card key={item.productId} className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
                                    <CardContent className="p-4 md:p-6 flex flex-row items-center gap-4">
                                        {/* Product Image */}
                                        <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden shrink-0 bg-muted border border-border/30">
                                            <img
                                                src={item.image || FALLBACK_IMAGE}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                }}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-1 block leading-tight">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Store className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                <span className="font-semibold text-foreground/80">{item.shopName || "Merchant"}</span>
                                            </div>
                                            <div className="text-xs font-semibold text-primary pt-0.5 md:hidden">
                                                ৳{item.price.toLocaleString()} × {item.quantity}
                                            </div>
                                        </div>

                                        {/* Total and single price */}
                                        <div className="hidden md:block text-right min-w-24 shrink-0">
                                            <div className="text-base font-extrabold text-foreground">
                                                ৳{itemSubtotal.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground font-medium pt-0.5">
                                                ৳{item.price.toLocaleString()} × {item.quantity}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Back to Cart Action */}
                    <div className="flex justify-start pt-2">
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-xl gap-2 font-bold hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                            <Link to="/cart">
                                <ArrowLeft className="h-4 w-4" />
                                Edit Cart
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Right Column: Sticky Summary and Payment Panel */}
                <div className="lg:col-span-4 sticky top-24">
                    <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md">
                        <CardContent className="p-6 space-y-6">
                            
                            {/* Coupon Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-primary" />
                                    Have a coupon?
                                </h3>
                                
                                {!appliedCoupon ? (
                                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                disabled={isApplyingCoupon}
                                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary uppercase"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isApplyingCoupon}
                                            className="rounded-xl font-bold h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200"
                                        >
                                            {isApplyingCoupon ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Apply"
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold p-3 rounded-2xl border border-emerald-500/20 flex items-center justify-between animate-in fade-in zoom-in duration-200">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <span className="text-xs">
                                                {appliedCoupon.code} applied! You save ৳{discount.toLocaleString()}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveCoupon}
                                            className="h-7 w-7 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/15"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="text-[11px] text-destructive font-semibold pl-1 animate-in slide-in-from-top-1 duration-200">
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            <Separator className="bg-border/60" />

                            {/* Price Breakdown */}
                            <div className="space-y-4 text-sm font-semibold text-muted-foreground">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-foreground font-bold">
                                        ৳{totalPrice.toLocaleString()}
                                    </span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                        <span>Coupon Discount</span>
                                        <span className="font-bold">
                                            -৳{discount.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span>Shipping</span>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-full font-bold px-2 py-0.5 text-[10px]">
                                        Free
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="bg-border/60" />

                            {/* Total */}
                            <div className="flex justify-between items-baseline">
                                <span className="text-base font-extrabold text-foreground">Total</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-primary">
                                        ৳{finalTotal.toLocaleString()}
                                    </span>
                                    <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                                        VAT included where applicable
                                    </p>
                                </div>
                            </div>

                            {/* Checkout CTA */}
                            <div className="space-y-3 pt-2">
                                <Button
                                    size="lg"
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full h-12 text-sm font-black tracking-wider uppercase rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] group bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order & Pay ৳{finalTotal.toLocaleString()}
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 font-medium pt-1">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span>🔒 Secure payment via SSLCommerz</span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

            </div>
        </main>
    );
}
