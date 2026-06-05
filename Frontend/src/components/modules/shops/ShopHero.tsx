// src/components/modules/shops/ShopHero.tsx

import { Search, Store, ShieldCheck, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ShopHeroProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    totalShops?: number;
}

const ShopHero = ({ searchTerm, onSearchChange, totalShops }: ShopHeroProps) => {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-primary/70 dark:from-primary/80 dark:via-primary/60 dark:to-indigo-900/80 px-6 py-16 md:py-20 lg:py-24 text-primary-foreground shadow-xl">

            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            <div className="pointer-events-none absolute top-1/2 right-1/3 h-40 w-40 rounded-full bg-white/5 blur-xl" />

            <div className="relative mx-auto max-w-3xl text-center space-y-6">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-medium border border-white/20">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Marketplace Vendors
                </div>

                {/* Heading */}
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl leading-tight">
                    Discover{" "}
                    <span className="underline decoration-white/40 decoration-4 underline-offset-4">
                        Trusted Shops
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto leading-relaxed">
                    Explore verified vendors and premium storefronts across Bangladesh.
                    Find the best sellers, top-rated shops, and exclusive deals.
                </p>

                {/* Search bar */}
                <div className="relative max-w-xl mx-auto mt-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="shop-search-input"
                        placeholder="Search shops by name, vendor, or address..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-12 pr-4 h-14 rounded-2xl bg-background text-foreground border-0 shadow-xl text-base focus-visible:ring-2 focus-visible:ring-white/50"
                    />
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm text-primary-foreground/75">
                    <div className="flex items-center gap-1.5">
                        <Store className="h-4 w-4" />
                        <span>
                            {totalShops
                                ? `${totalShops}+ Active Shops`
                                : "Active Shops"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        <span>100% Verified Vendors</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Truck className="h-4 w-4" />
                        <span>Fast Delivery Available</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopHero;
