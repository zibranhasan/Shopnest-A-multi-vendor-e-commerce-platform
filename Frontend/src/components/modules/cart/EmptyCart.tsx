// src/components/modules/cart/EmptyCart.tsx

import { ShoppingCart, MoveRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function EmptyCart() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md shadow-sm space-y-6 max-w-xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Visual Icon Container */}
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 border border-primary/20 text-primary shadow-inner shadow-primary/5 animate-pulse">
                <ShoppingCart className="h-10 w-10 text-primary" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-destructive border-2 border-background" />
            </div>

            {/* Typography */}
            <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
                    Your cart is empty
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                    Looks like you haven't added anything to your cart yet. Explore our marketplace and find the best deals!
                </p>
            </div>

            {/* CTA Button */}
            <Button asChild className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] group">
                <Link to="/products" className="inline-flex items-center gap-2">
                    Start Shopping
                    <MoveRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    );
}
