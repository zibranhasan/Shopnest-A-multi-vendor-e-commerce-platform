// src/components/modules/shops/ShopCard.tsx

import { useNavigate } from "react-router";
import {
    Star,
    MapPin,
    Package,
    ShoppingBag,
    User,
    CalendarDays,
    ArrowRight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IShop } from "@/types/shop.type";

interface ShopCardProps {
    shop: IShop;
}

const FALLBACK_BANNER =
    "https://placehold.co/800x300/f5f5f5/a3a3a3?text=Shop+Banner";
const FALLBACK_LOGO =
    "https://placehold.co/80x80/f5f5f5/a3a3a3?text=Logo";

const ShopCard = ({ shop }: ShopCardProps) => {
    const navigate = useNavigate();

    const rating = shop.rating ?? 0;
    const ratingDisplay = rating > 0 ? rating.toFixed(1) : null;

    const joinedDate = shop.createdAt
        ? new Date(shop.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        })
        : null;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring">

            {/* ── Banner Image ── */}
            <div className="relative h-44 overflow-hidden bg-muted">
                <img
                    src={shop.banner || FALLBACK_BANNER}
                    alt={`${shop.name} banner`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_BANNER;
                    }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Status Badge top-right */}
                <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500/90 text-white border-0 font-semibold text-xs backdrop-blur-sm px-2.5 py-1 rounded-full shadow">
                        Active
                    </Badge>
                </div>

                {/* Date top-left */}
                {joinedDate && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-xs text-white/90">
                        <CalendarDays className="h-3 w-3" />
                        Since {joinedDate}
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 px-5 pb-5">

                {/* Logo + Name row */}
                <div className="flex items-end gap-3 -mt-7 mb-4">
                    <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-background shadow-md">
                        <img
                            src={shop.logo || FALLBACK_LOGO}
                            alt={`${shop.name} logo`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = FALLBACK_LOGO;
                            }}
                        />
                    </div>
                    <div className="pb-0.5 min-w-0">
                        <h3 className="font-bold text-base leading-tight text-foreground truncate group-hover:text-primary transition-colors duration-200">
                            {shop.name}
                        </h3>
                        {shop.vendor?.name && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{shop.vendor.name}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Description */}
                {shop.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                        {shop.description}
                    </p>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {/* Rating */}
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60">
                        <div className="flex items-center gap-0.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-bold text-foreground">
                                {ratingDisplay ?? "—"}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            Rating
                        </span>
                    </div>

                    {/* Products */}
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60">
                        <div className="flex items-center gap-0.5">
                            <Package className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-bold text-foreground">
                                {shop.totalProducts ?? 0}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            Products
                        </span>
                    </div>

                    {/* Sales */}
                    <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60">
                        <div className="flex items-center gap-0.5">
                            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-bold text-foreground">
                                {shop.totalSales ?? 0}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            Sales
                        </span>
                    </div>
                </div>

                {/* Address */}
                {shop.address && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-5">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/70" />
                        <span className="line-clamp-1">{shop.address}</span>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <Button
                    id={`shop-card-btn-${shop.slug}`}
                    className="w-full rounded-2xl h-10 font-semibold gap-2 transition-all duration-200 hover:gap-3"
                    onClick={() => navigate(`/shops/${shop.slug}`)}
                >
                    About Shop
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </article>
    );
};

export default ShopCard;
