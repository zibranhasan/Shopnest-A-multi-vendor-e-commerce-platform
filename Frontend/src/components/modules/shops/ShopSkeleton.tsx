// src/components/modules/shops/ShopSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

// ─────────────────────────────────────────────
// Single Shop Card Skeleton
// ─────────────────────────────────────────────
const ShopCardSkeleton = () => (
    <div className="rounded-3xl overflow-hidden border border-border bg-card shadow-sm">
        {/* Banner */}
        <Skeleton className="h-44 w-full rounded-none" />

        <div className="p-5 space-y-4 -mt-8 relative">
            {/* Logo overlap */}
            <Skeleton className="h-16 w-16 rounded-2xl border-4 border-card" />

            {/* Name + badge */}
            <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>

            {/* Stats row */}
            <div className="flex gap-4">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            {/* Address */}
            <Skeleton className="h-4 w-2/3 rounded-full" />

            {/* Button */}
            <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Shops Grid Skeleton (6 cards)
// ─────────────────────────────────────────────
export const ShopsGridSkeleton = ({ count = 6 }: { count?: number }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
            <ShopCardSkeleton key={i} />
        ))}
    </div>
);

// ─────────────────────────────────────────────
// Shop Details Hero Skeleton
// ─────────────────────────────────────────────
export const ShopDetailsSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
        </div>

        {/* Banner */}
        <Skeleton className="h-64 w-full rounded-3xl md:h-80" />

        {/* Info block below banner */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-7 w-48 rounded-xl" />
                        <Skeleton className="h-5 w-32 rounded-lg" />
                        <Skeleton className="h-4 w-full rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-5 w-full rounded-lg" />
                    <Skeleton className="h-5 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-5 w-2/3 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-40 rounded-2xl" />
            </div>

            {/* Stats panel */}
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border">
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-5 w-16 rounded-lg" />
                            <Skeleton className="h-4 w-24 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Products skeleton */}
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-3xl border border-border overflow-hidden">
                        <Skeleton className="aspect-square w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-5 w-24 rounded-lg" />
                            <div className="flex justify-between pt-1">
                                <Skeleton className="h-3 w-20 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
