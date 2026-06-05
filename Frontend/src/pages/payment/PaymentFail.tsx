// src/pages/payment/PaymentFail.tsx

import { Link, useSearchParams } from "react-router";
import { XCircle, ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFail() {
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get("transactionId") || "";

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full text-center p-8 border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6 animate-in fade-in duration-300">
                
                {/* Large animated red X circle */}
                <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mx-auto shadow-inner animate-pulse">
                    <XCircle className="h-12 w-12 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-destructive">
                        Payment Failed
                    </h1>
                    <p className="text-muted-foreground text-sm font-semibold leading-relaxed max-w-xs mx-auto">
                        Your payment could not be processed. Your order has been cancelled and stock has been restored.
                    </p>
                </div>

                {/* Monospace, muted box for Transaction ID if available */}
                {transactionId && (
                    <div className="bg-muted/50 dark:bg-muted/20 border border-border/60 rounded-2xl py-3 px-4 text-sm font-mono text-muted-foreground break-all select-all">
                        <span className="font-semibold text-foreground/80">Transaction ID:</span> {transactionId}
                    </div>
                )}

                {/* Two buttons */}
                <div className="flex flex-col gap-3 pt-2">
                    <Button asChild className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-2 group">
                        <Link to="/products">
                            Try Again
                            <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-xl h-11 w-full font-bold hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                        <Link to="/customer/orders">
                            View My Orders
                            <ShoppingBag className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

            </div>
        </main>
    );
}
