// src/components/modules/shops/ShopStats.tsx

import {
    Star,
    Package,
    ShoppingBag,
    TrendingUp,
    ShieldCheck,
    Truck,
    RotateCcw,
    Award,
} from "lucide-react";
import type { IShop } from "@/types/shop.type";

interface ShopStatsProps {
    shop: IShop;
}

const ShopStats = ({ shop }: ShopStatsProps) => {
    const rating = shop.rating ?? 0;
    const ratingDisplay = rating > 0 ? rating.toFixed(1) : "N/A";

    const metrics = [
        {
            icon: Star,
            iconClass: "text-amber-400",
            bgClass: "bg-amber-400/10",
            label: "Avg. Rating",
            value: ratingDisplay,
            sub: "out of 5.0",
        },
        {
            icon: Package,
            iconClass: "text-primary",
            bgClass: "bg-primary/10",
            label: "Active Products",
            value: (shop.totalProducts ?? 0).toLocaleString(),
            sub: "items listed",
        },
        {
            icon: ShoppingBag,
            iconClass: "text-emerald-500",
            bgClass: "bg-emerald-500/10",
            label: "Total Sales",
            value: (shop.totalSales ?? 0).toLocaleString(),
            sub: "orders fulfilled",
        },
        {
            icon: TrendingUp,
            iconClass: "text-indigo-500",
            bgClass: "bg-indigo-500/10",
            label: "Revenue",
            value: shop.totalRevenue
                ? `৳${shop.totalRevenue.toLocaleString()}`
                : "—",
            sub: "total earned",
        },
    ];

    const trustBadges = [
        { icon: ShieldCheck, label: "Verified Vendor" },
        { icon: Truck, label: "Fast Delivery" },
        { icon: RotateCcw, label: "Easy Returns" },
        { icon: Award, label: "Top Seller" },
    ];

    return (
        <div className="space-y-4">
            {/* ── Metrics ── */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
                {metrics.map(({ icon: Icon, iconClass, bgClass, label, value, sub }) => (
                    <div
                        key={label}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
                            <Icon className={`h-5 w-5 ${iconClass}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg font-extrabold text-foreground leading-none">
                                {value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                            <p className="text-[10px] text-muted-foreground/60">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Trust Badges ── */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Shop Guarantees
                </p>
                <div className="space-y-2">
                    {trustBadges.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2.5 text-sm font-medium text-foreground"
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopStats;
