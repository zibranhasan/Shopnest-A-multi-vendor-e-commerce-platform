// src/components/modules/wishlist/EmptyWishlist.tsx

import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function EmptyWishlist() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6 max-w-md mx-auto">
            {/* Elegant Outer Icon container with glassmorphism and breathing animation */}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-rose-500/5 text-rose-500 border border-rose-500/10 shadow-lg shadow-rose-500/5 animate-pulse">
                <Heart className="h-10 w-10 text-rose-500/40" />
                <span className="absolute top-6 left-6 text-xl">✨</span>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                    Your wishlist is empty
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    Explore our products to find something you love. Save items to your wishlist and they will show up here!
                </p>
            </div>

            <Button asChild size="lg" className="rounded-2xl font-bold gap-2 px-6 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <Link to="/products">
                    Explore Products
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
