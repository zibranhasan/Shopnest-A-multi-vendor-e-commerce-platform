// src/pages/shops/ShopDetails.tsx

import { useRef } from "react";
import { Link, useParams } from "react-router";
import { Home, ChevronRight, Store, MoveLeft, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetShopBySlugQuery } from "@/redux/features/shop/shop.api";
import type { IShop } from "@/types/shop.type";

import ShopInfo from "@/components/modules/shops/ShopInfo";
import ShopStats from "@/components/modules/shops/ShopStats";
import ShopProducts from "@/components/modules/shops/ShopProducts";
import { ShopDetailsSkeleton } from "@/components/modules/shops/ShopSkeleton";

// ─────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────
const Breadcrumbs = ({ shopName }: { shopName: string }) => (
    <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
                <Link
                    to="/"
                    className="flex items-center gap-1 hover:text-foreground transition-colors duration-150"
                >
                    <Home className="h-3.5 w-3.5" />
                    Home
                </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5 text-border" /></li>
            <li>
                <Link
                    to="/shops"
                    className="flex items-center gap-1 hover:text-foreground transition-colors duration-150"
                >
                    <Store className="h-3.5 w-3.5" />
                    Shops
                </Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5 text-border" /></li>
            <li
                className="font-medium text-foreground max-w-[200px] truncate"
                aria-current="page"
            >
                {shopName}
            </li>
        </ol>
    </nav>
);

// ─────────────────────────────────────────────
// Error State
// ─────────────────────────────────────────────
const ShopNotFound = ({ slug }: { slug: string }) => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-12 w-12 text-destructive/60" />
        </div>
        <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground">Shop Not Found</h1>
            <p className="text-muted-foreground max-w-sm text-base">
                We couldn't find a shop matching{" "}
                <span className="font-mono font-semibold text-foreground">"{slug}"</span>.
                It may have been removed or the link is incorrect.
            </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
            <Button
                variant="outline"
                className="rounded-2xl gap-2"
                onClick={() => window.history.back()}
            >
                <MoveLeft className="h-4 w-4" />
                Go Back
            </Button>
            <Button asChild className="rounded-2xl">
                <Link to="/shops">Browse All Shops</Link>
            </Button>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const ShopDetails = () => {
    const { slug } = useParams<{ slug: string }>();
    const productsRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        isError,
    } = useGetShopBySlugQuery(slug ?? "", { skip: !slug });

    // Smooth scroll to products section
    const handleScrollToProducts = () => {
        productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (isLoading) {
        return <ShopDetailsSkeleton />;
    }

    const shop = data?.data as IShop | undefined;

    if (isError || !shop) {
        return (
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <ShopNotFound slug={slug ?? ""} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl space-y-10 px-4 py-8">

                {/* Breadcrumbs */}
                <Breadcrumbs shopName={shop.name} />

                {/* ── Shop Banner + Info ── */}
                <ShopInfo shop={shop} onScrollToProducts={handleScrollToProducts} />

                {/* ── About + Stats ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* About (left) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About section */}
                        {shop.description && (
                            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-3">
                                <h2 className="text-lg font-bold text-foreground">
                                    About {shop.name}
                                </h2>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {shop.description}
                                </p>
                            </div>
                        )}

                        {/* Vendor info card */}
                        {shop.vendor?.name && (
                            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
                                <h2 className="text-lg font-bold text-foreground mb-4">
                                    Shop Owner
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border">
                                        {shop.vendor.picture ? (
                                            <img
                                                src={shop.vendor.picture}
                                                alt={shop.vendor.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                                {shop.vendor.name[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{shop.vendor.name}</p>
                                        {shop.vendor.email && (
                                            <p className="text-sm text-muted-foreground">{shop.vendor.email}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-0.5">Verified Vendor</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats sidebar (right) */}
                    <div className="lg:col-span-1">
                        <ShopStats shop={shop} />
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="h-px w-full bg-border" />

                {/* ── Products Section ── */}
                <div ref={productsRef} className="scroll-mt-8">
                    <ShopProducts shopId={shop._id} shopName={shop.name} />
                </div>

            </div>
        </main>
    );
};

export default ShopDetails;