// src/components/modules/shops/ShopInfo.tsx

import {
    MapPin,
    Mail,
    Phone,
    User,
    Star,
    Package,
    ShoppingBag,
    ShieldCheck,
    ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IShop } from "@/types/shop.type";

interface ShopInfoProps {
    shop: IShop;
    onScrollToProducts: () => void;
}

const FALLBACK_BANNER =
    "https://placehold.co/1400x400/f5f5f5/a3a3a3?text=Shop+Banner";
const FALLBACK_LOGO =
    "https://placehold.co/120x120/f5f5f5/a3a3a3?text=Logo";

const ShopInfo = ({ shop, onScrollToProducts }: ShopInfoProps) => {
    const rating = shop.rating ?? 0;
    const ratingDisplay = rating > 0 ? rating.toFixed(1) : "N/A";

    return (
        <section className="space-y-0">

            {/* ── Banner ── */}
            <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-muted md:h-72 lg:h-80">
                <img
                    src={shop.banner || FALLBACK_BANNER}
                    alt={`${shop.name} banner`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_BANNER;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0 font-semibold px-3 py-1.5 rounded-full shadow-lg gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Shop
                    </Badge>
                </div>
            </div>

            {/* ── Profile Card (overlapping banner) ── */}
            <div className="relative -mt-10 mx-4 md:mx-6 rounded-3xl border border-border bg-card shadow-xl px-6 py-6 md:px-8 md:py-8">

                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">

                    {/* Logo */}
                    <div className="relative shrink-0 -mt-16 md:-mt-20">
                        <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-card bg-background shadow-lg md:h-24 md:w-24">
                            <img
                                src={shop.logo || FALLBACK_LOGO}
                                alt={`${shop.name} logo`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_LOGO;
                                }}
                            />
                        </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Name + vendor */}
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground leading-tight md:text-3xl">
                                {shop.name}
                            </h1>
                            {shop.vendor?.name && (
                                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <User className="h-3.5 w-3.5" />
                                    Managed by{" "}
                                    <span className="font-semibold text-foreground">
                                        {shop.vendor.name}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        {shop.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                {shop.description}
                            </p>
                        )}

                        {/* Contact & Location grid */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {shop.address && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                                    <span>{shop.address}</span>
                                </div>
                            )}
                            {shop.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                                    <a
                                        href={`mailto:${shop.email}`}
                                        className="hover:text-primary hover:underline underline-offset-2 transition-colors"
                                    >
                                        {shop.email}
                                    </a>
                                </div>
                            )}
                            {shop.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                                    <a
                                        href={`tel:${shop.phone}`}
                                        className="hover:text-primary hover:underline underline-offset-2 transition-colors"
                                    >
                                        {shop.phone}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Quick stats inline row */}
                        <div className="flex flex-wrap gap-4 pt-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>{ratingDisplay}</span>
                                <span className="text-muted-foreground font-normal">rating</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <Package className="h-4 w-4 text-primary" />
                                <span>{shop.totalProducts ?? 0}</span>
                                <span className="text-muted-foreground font-normal">products</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                <span>{shop.totalSales ?? 0}</span>
                                <span className="text-muted-foreground font-normal">sales</span>
                            </div>
                        </div>

                        {/* Product List CTA */}
                        <div className="pt-1">
                            <Button
                                id="scroll-to-products-btn"
                                onClick={onScrollToProducts}
                                className="rounded-2xl px-6 h-11 font-semibold gap-2 transition-all duration-200 hover:gap-3"
                            >
                                View Product List
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopInfo;
