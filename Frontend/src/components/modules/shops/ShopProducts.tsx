// src/components/modules/shops/ShopProducts.tsx

import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ArrowRight, Star, Package, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import { useDebounce } from "@/hooks/useDebounce";
import type { IProduct } from "@/types/product.type";
import EmptyShopState from "./EmptyShopState";

interface ShopProductsProps {
    shopId: string;
    shopName: string;
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/f5f5f5/a3a3a3?text=No+Image";

// ─────────────────────────────────────────────
// Product Card (shop-specific variant)
// ─────────────────────────────────────────────
const ShopProductCard = ({ product }: { product: IProduct }) => {
    const navigate = useNavigate();
    const displayPrice = product.discountPrice ?? product.price;
    const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
    const imageUrl = product.images?.[0] || FALLBACK_IMAGE;
    const isOutOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";

    return (
        <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                />

                {/* Discount badge */}
                {hasDiscount && product.discountPercent && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-destructive text-destructive-foreground font-semibold text-xs px-2 py-1 rounded-full">
                            -{product.discountPercent}% Off
                        </Badge>
                    </div>
                )}

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                            Out of Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 space-y-3">

                {/* Category */}
                {product.category?.name && (
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {product.category.name}
                    </p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                    {product.name}
                </h3>

                {/* Rating */}
                {product.ratings !== undefined && product.ratings > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-foreground">
                            {product.ratings.toFixed(1)}
                        </span>
                        {product.sold !== undefined && (
                            <span className="text-xs text-muted-foreground">
                                · {product.sold} sold
                            </span>
                        )}
                    </div>
                )}

                {/* Stock */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-primary">
                        ৳{displayPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                            ৳{product.price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <Button
                    id={`shop-product-btn-${product.slug}`}
                    size="sm"
                    className="w-full rounded-2xl h-9 text-xs font-semibold gap-1.5 transition-all duration-200 hover:gap-2.5"
                    onClick={() => navigate(`/products/${product.slug}`)}
                    disabled={isOutOfStock}
                >
                    Product Details
                    <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </article>
    );
};

// ─────────────────────────────────────────────
// Products Grid Skeleton
// ─────────────────────────────────────────────
const ProductsLoadingSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border overflow-hidden">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-3 w-20 rounded-full" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-5 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-full rounded-2xl" />
                </div>
            </div>
        ))}
    </div>
);

// ─────────────────────────────────────────────
// Main ShopProducts Component
// ─────────────────────────────────────────────
const ShopProducts = ({ shopId, shopName }: ShopProductsProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Build query params
    const queryParams: Record<string, unknown> = {
        shop: shopId,
    };
    if (debouncedSearch) queryParams.searchTerm = debouncedSearch;
    if (sortBy === "price_asc") queryParams.sort = "price";
    if (sortBy === "price_desc") queryParams.sort = "-price";
    if (sortBy === "rating") queryParams.sort = "-ratings";
    if (sortBy === "newest") queryParams.sort = "-createdAt";

    const { data, isLoading } = useGetAllProductsQuery(queryParams);

    const products: IProduct[] = data?.data?.data ?? data?.data ?? [];
    const totalProducts = data?.data?.meta?.total ?? products.length;

    const handleClearSearch = () => {
        setSearchTerm("");
        setSortBy("newest");
    };

    return (
        <section id="shop-products-section" className="space-y-6">

            {/* ── Section Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-foreground">
                        Products from{" "}
                        <span className="text-primary">{shopName}</span>
                    </h2>
                    {!isLoading && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {totalProducts} product{totalProducts !== 1 ? "s" : ""} available
                        </p>
                    )}
                </div>
            </div>

            {/* ── Filters Bar ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="shop-products-search"
                        placeholder="Search products in this shop..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-2xl h-10"
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2 shrink-0">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="shop-products-sort" className="rounded-2xl h-10 w-44">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price_asc">Price: Low → High</SelectItem>
                            <SelectItem value="price_desc">Price: High → Low</SelectItem>
                            <SelectItem value="rating">Highest Rated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Content ── */}
            {isLoading ? (
                <ProductsLoadingSkeleton />
            ) : products.length === 0 ? (
                <EmptyShopState
                    type="products"
                    onClear={handleClearSearch}
                />
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product: IProduct) => (
                        <ShopProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ShopProducts;
