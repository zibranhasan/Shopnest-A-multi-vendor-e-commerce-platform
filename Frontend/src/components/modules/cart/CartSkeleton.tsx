// src/components/modules/cart/CartSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CartSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-48 rounded-2xl" />
                <Skeleton className="h-4 w-32 rounded-lg" />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left Side: Items list skeleton (8 columns) */}
                <div className="lg:col-span-8 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="rounded-3xl border border-border/50 bg-card">
                            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4">
                                {/* Product Image */}
                                <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-2xl shrink-0" />
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-2 w-full">
                                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                                    <Skeleton className="h-4 w-1/3 rounded-lg" />
                                    <Skeleton className="h-4 w-1/4 rounded-lg md:hidden" />
                                </div>

                                {/* Quantity, Price, Subtotal Skeletons */}
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                                    <Skeleton className="h-10 w-28 rounded-xl" />
                                    <div className="text-right space-y-1 min-w-24">
                                        <Skeleton className="h-5 w-16 rounded-lg ml-auto" />
                                        <Skeleton className="h-4 w-12 rounded-lg ml-auto" />
                                    </div>
                                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right Side: Summary skeleton (4 columns) */}
                <div className="lg:col-span-4">
                    <Card className="rounded-3xl border border-border bg-card/50 backdrop-blur-md shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <Skeleton className="h-7 w-1/2 rounded-lg" />
                            
                            <div className="space-y-4 border-b border-border/50 pb-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20 rounded-md" />
                                    <Skeleton className="h-4 w-16 rounded-md" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-24 rounded-md" />
                                    <Skeleton className="h-4 w-12 rounded-md" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-28 rounded-md" />
                                    <Skeleton className="h-4 w-16 rounded-md" />
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-16 rounded-lg" />
                                <Skeleton className="h-6 w-24 rounded-lg" />
                            </div>

                            <Skeleton className="h-12 w-full rounded-2xl" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
