// src/pages/payment/PaymentSuccess.tsx

import { Link, useSearchParams } from "react-router";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("transactionId") || "N/A";

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center p-8 border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6 animate-in fade-in duration-300">
                
                {/* Large animated green checkmark circle */}
                <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner animate-bounce duration-1000">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        Payment Successful!
                    </h1>
                    <p className="text-muted-foreground text-sm font-semibold leading-relaxed max-w-xs mx-auto">
                        Your order has been confirmed and is being processed.
                    </p>
                </div>

                {/* Monospace, muted box for Transaction ID */}
                <div className="bg-muted/50 dark:bg-muted/20 border border-border/60 rounded-2xl py-3 px-4 text-sm font-mono text-muted-foreground break-all select-all">
                    <span className="font-semibold text-foreground/80">Transaction ID:</span> {transactionId}
                </div>

                {/* Two buttons */}
                <div className="flex flex-col gap-3 pt-2">
                    <Button asChild className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 group">
                        <Link to="/customer/orders">
                            View My Orders
                            <ShoppingBag className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-xl h-11 w-full font-bold hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                        <Link to="/products">
                            Continue Shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

            </div>
        </main>
    );
}
