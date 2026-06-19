import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/modules/products/ProductCard";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import type { IProduct } from "@/types";

const FeaturedProducts = () => {
    // Fetch products
    const { data: productsData, isLoading } = useGetAllProductsQuery({
        limit: 8,
        sort: "-createdAt",
    });

    const products = productsData?.data || [];
    
    // Filter active products on frontend if status is not filtered by default
    const activeProducts = products.filter((product: IProduct) => product.status === "ACTIVE");

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-2 text-left">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Featured Products
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Handpicked just for you
                        </p>
                    </div>
                    <Button variant="ghost" asChild className="text-primary hover:text-primary/80 font-bold flex items-center gap-1 hover:bg-transparent px-0 md:px-4 cursor-pointer">
                        <Link to="/products">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Loading Skeleton */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="rounded-3xl border border-border bg-card p-5 space-y-4 shadow-sm">
                                <Skeleton className="aspect-square w-full rounded-2xl" />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-3 w-16 rounded" />
                                        <Skeleton className="h-3 w-16 rounded" />
                                    </div>
                                    <Skeleton className="h-4 w-full rounded" />
                                    <Skeleton className="h-4 w-2/3 rounded" />
                                    <div className="flex justify-between items-center pt-2">
                                        <Skeleton className="h-5 w-20 rounded" />
                                        <Skeleton className="h-3 w-12 rounded" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="h-9 flex-1 rounded-xl" />
                                        <Skeleton className="h-9 w-12 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeProducts.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-3xl bg-card">
                        <p className="text-muted-foreground font-semibold">No products available yet.</p>
                        <Button className="mt-4 bg-primary text-primary-foreground font-bold cursor-pointer" asChild>
                            <Link to="/products">Explore Products</Link>
                        </Button>
                    </div>
                ) : (
                    /* Products Grid */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {activeProducts.map((product: IProduct) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
