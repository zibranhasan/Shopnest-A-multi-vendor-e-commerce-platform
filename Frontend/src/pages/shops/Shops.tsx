// src/pages/shops/Shops.tsx

import { useState } from "react";
import { Link } from "react-router";
import { Home, ChevronRight, Store, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useGetAllShopsQuery } from "@/redux/features/shop/shop.api";
import { useDebounce } from "@/hooks/useDebounce";
import type { IShop } from "@/types/shop.type";

import ShopHero from "@/components/modules/shops/ShopHero";
import ShopCard from "@/components/modules/shops/ShopCard";
import { ShopsGridSkeleton } from "@/components/modules/shops/ShopSkeleton";
import EmptyShopState from "@/components/modules/shops/EmptyShopState";

// ─────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────
const Breadcrumbs = () => (
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
            <li className="text-foreground font-medium flex items-center gap-1" aria-current="page">
                <Store className="h-3.5 w-3.5" />
                Shops
            </li>
        </ol>
    </nav>
);

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────
interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter(
        (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
    );

    const withEllipsis: (number | "…")[] = [];
    let prev: number | null = null;
    for (const p of visiblePages) {
        if (prev !== null && p - prev > 1) withEllipsis.push("…");
        withEllipsis.push(p);
        prev = p;
    }

    return (
        <div className="flex items-center justify-center gap-2 pt-4">
            <Button
                id="pagination-prev"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
            >
                Previous
            </Button>

            {withEllipsis.map((p, i) =>
                p === "…" ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                    <Button
                        key={p}
                        id={`pagination-page-${p}`}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        className="rounded-xl w-9"
                        onClick={() => onPageChange(p as number)}
                    >
                        {p}
                    </Button>
                )
            )}

            <Button
                id="pagination-next"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Next
            </Button>
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const Shops = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(searchTerm, 500);

    // ── Query params ──
    const queryParams: Record<string, unknown> = {
        page,
        limit: 9,
    };
    if (debouncedSearch) queryParams.searchTerm = debouncedSearch;
    if (sortBy === "rating") queryParams.sort = "-rating";
    if (sortBy === "newest") queryParams.sort = "-createdAt";
    if (sortBy === "products") queryParams.sort = "-totalProducts";
    if (sortBy === "sales") queryParams.sort = "-totalSales";

    const { data, isLoading, isError, refetch } = useGetAllShopsQuery(queryParams);

    // ── Data extraction ──
    const shops: IShop[] = data?.data?.data ?? data?.data ?? [];
    const meta = data?.data?.meta;
    const totalPages = meta?.totalPages ?? 1;
    const totalShops = meta?.total;

    const hasActiveFilter = !!debouncedSearch || sortBy !== "newest";

    const handleClearFilters = () => {
        setSearchTerm("");
        setSortBy("newest");
        setPage(1);
    };

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">

                {/* Breadcrumbs */}
                <Breadcrumbs />

                {/* Hero + Search */}
                <ShopHero
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    totalShops={totalShops}
                />

                {/* Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Results count + active filter badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {!isLoading && (
                            <p className="text-sm text-muted-foreground">
                                {shops.length > 0
                                    ? `Showing ${shops.length} shop${shops.length !== 1 ? "s" : ""}${totalShops ? ` of ${totalShops}` : ""}`
                                    : "No shops found"}
                            </p>
                        )}
                        {debouncedSearch && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer gap-1.5 pl-2.5 pr-2"
                                onClick={() => { setSearchTerm(""); setPage(1); }}
                            >
                                "{debouncedSearch}"
                                <X className="h-3 w-3" />
                            </Badge>
                        )}
                    </div>

                    {/* Sort + Clear */}
                    <div className="flex items-center gap-2 shrink-0">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <Select
                            value={sortBy}
                            onValueChange={(v) => { setSortBy(v); setPage(1); }}
                        >
                            <SelectTrigger id="shops-sort-select" className="rounded-2xl h-10 w-44">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="products">Most Products</SelectItem>
                                <SelectItem value="sales">Most Sales</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl gap-1.5 text-muted-foreground"
                                onClick={handleClearFilters}
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Loading ── */}
                {isLoading && <ShopsGridSkeleton count={9} />}

                {/* ── Error ── */}
                {isError && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 border border-destructive/20">
                            <Store className="h-10 w-10 text-destructive/60" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-foreground">Failed to Load Shops</h2>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                Something went wrong while fetching shops. Please try again.
                            </p>
                        </div>
                        <Button
                            id="shops-retry-btn"
                            className="rounded-2xl px-6"
                            onClick={() => refetch()}
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* ── Empty ── */}
                {!isLoading && !isError && shops.length === 0 && (
                    <EmptyShopState
                        type="shops"
                        onClear={hasActiveFilter ? handleClearFilters : undefined}
                    />
                )}

                {/* ── Shops Grid ── */}
                {!isLoading && !isError && shops.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {shops.map((shop: IShop) => (
                                <ShopCard key={shop._id} shop={shop} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Shops;