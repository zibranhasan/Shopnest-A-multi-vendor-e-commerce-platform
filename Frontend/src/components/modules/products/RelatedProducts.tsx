// src/components/modules/products/RelatedProducts.tsx

import { Link } from "react-router";
import { ArrowRight, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import ProductCard from "./ProductCard";
import type { IProduct } from "@/types/product.type";

interface RelatedProductsProps {
    categoryId: string;
    currentProductId: string;
}

const RelatedProducts = ({ categoryId, currentProductId }: RelatedProductsProps) => {
    const { data, isLoading } = useGetAllProductsQuery(
        { category: categoryId, limit: "8" },
    );

    const allProducts: IProduct[] = data?.data ?? [];
    const related = allProducts
        .filter((p) => p._id !== currentProductId)
        .slice(0, 4);

    return (
        <section className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-foreground">
                        Related Products
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        More from this category
                    </p>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl gap-1.5">
                    <Link to="/products">
                        View All
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            {/* Skeleton Loading */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-3xl border border-border overflow-hidden"
                        >
                            <Skeleton className="aspect-square w-full rounded-none" />
                            <div className="p-5 space-y-3">
                                <Skeleton className="h-3 w-20 rounded-full" />
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4 rounded-lg" />
                                <Skeleton className="h-5 w-24 rounded-lg" />
                                <div className="flex justify-between items-center pt-1">
                                    <Skeleton className="h-3 w-20 rounded-full" />
                                    <Skeleton className="h-8 w-16 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && related.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-border bg-muted/30 text-center gap-4">
                    <div className="p-4 rounded-full bg-muted">
                        <PackageSearch className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">No related products found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Check out our full collection
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="rounded-xl">
                        <Link to="/products">Browse Products</Link>
                    </Button>
                </div>
            )}

            {/* Related Products Grid */}
            {!isLoading && related.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {related.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default RelatedProducts;
