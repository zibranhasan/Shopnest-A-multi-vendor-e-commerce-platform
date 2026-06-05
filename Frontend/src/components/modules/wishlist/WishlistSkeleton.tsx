// src/components/modules/wishlist/WishlistSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-4 w-72 rounded-lg" />
            </div>

            {/* Product Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm flex flex-col h-full"
                    >
                        {/* Image Thumbnail Shimmer */}
                        <div className="relative aspect-square w-full bg-muted">
                            <Skeleton className="h-full w-full rounded-none" />
                        </div>

                        {/* Content Shimmer */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                                {/* Category */}
                                <Skeleton className="h-3 w-16 rounded-full" />
                                {/* Title */}
                                <Skeleton className="h-5 w-full rounded-lg" />
                                <Skeleton className="h-5 w-2/3 rounded-lg" />
                            </div>

                            <div className="space-y-4 pt-2">
                                {/* Price + Stock */}
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-6 w-20 rounded-md" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>

                                {/* Divider */}
                                <Skeleton className="h-px w-full" />

                                {/* Buttons Shimmer */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        {/* View Details Button */}
                                        <Skeleton className="h-9 flex-1 rounded-xl" />
                                        {/* Remove Button */}
                                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                                    </div>
                                    {/* Add to Cart Button */}
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
