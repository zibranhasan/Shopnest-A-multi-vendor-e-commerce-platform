// src/components/modules/cart/CartSummary.tsx

import { useNavigate } from "react-router";
import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
    subtotal: number;
}

export default function CartSummary({ subtotal }: CartSummaryProps) {
    const navigate = useNavigate();

    // Standard Shipping logic (৳60 Flat rate, Free over ৳1,500)
    const shippingThreshold = 1500;
    const shippingCost = subtotal >= shippingThreshold ? 0 : 60;
    const discount = 0; // future placeholder
    const total = subtotal + shippingCost - discount;

    const handleCheckout = () => {
        navigate("/checkout");
    };

    return (
        <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm sticky top-24 transition-all duration-300 hover:shadow-md">
            <CardContent className="p-6 space-y-6">
                <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                    Order Summary
                </h3>

                {/* Subtotal list */}
                <div className="space-y-4 text-sm font-semibold text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <span>Subtotal</span>
                        <span className="text-foreground font-bold">
                            ৳{subtotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                            Shipping Fee
                            {shippingCost === 0 && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                                    Free
                                </span>
                            )}
                        </span>
                        <span className="text-foreground font-bold">
                            {shippingCost === 0 ? "৳0" : `৳${shippingCost.toLocaleString()}`}
                        </span>
                    </div>

                    {discount > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                            <span>Discount</span>
                            <span className="font-bold">
                                -৳{discount.toLocaleString()}
                            </span>
                        </div>
                    )}

                    {/* Free shipping progress/bar if below threshold */}
                    {subtotal < shippingThreshold && (
                        <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 flex items-start gap-2.5">
                            <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-primary/95 leading-snug font-medium">
                                Add <span className="font-extrabold">৳{(shippingThreshold - subtotal).toLocaleString()}</span> more to unlock <span className="font-bold">FREE SHIPPING</span>!
                            </p>
                        </div>
                    )}
                </div>

                <Separator className="bg-border/60" />

                {/* Total */}
                <div className="flex justify-between items-baseline">
                    <span className="text-base font-extrabold text-foreground">Total</span>
                    <div className="text-right">
                        <span className="text-2xl font-black text-primary">
                            ৳{total.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted-foreground font-medium pt-0.5">
                            VAT included where applicable
                        </p>
                    </div>
                </div>

                {/* Checkout Action CTA */}
                <div className="space-y-4 pt-2">
                    <Button
                        size="lg"
                        className="w-full h-12 text-sm font-black tracking-wider uppercase rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] group"
                        onClick={handleCheckout}
                    >
                        PROCEED TO CHECKOUT
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Secure marketplace Checkout</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
