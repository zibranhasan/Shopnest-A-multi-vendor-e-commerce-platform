import { Link } from "react-router";
import { ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllShopsQuery } from "@/redux/features/shop/shop.api";
import type { IShop } from "@/types";

// Helper for colored fallbacks based on shop name
const getFallbackBgColor = (name: string) => {
    const colors = [
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

const TopShops = () => {
    const { data: shopsData, isLoading } = useGetAllShopsQuery({ limit: 6 });
    const shops = shopsData?.data || [];

    // Filter active shops
    const activeShops = shops.filter((shop: IShop) => shop.status === "ACTIVE");

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-10">
                    <div className="space-y-2 text-left">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Top Shops
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">
                            Trusted vendors on Shopnest
                        </p>
                    </div>
                    <Button variant="ghost" asChild className="text-primary hover:text-primary/80 font-bold flex items-center gap-1 hover:bg-transparent px-0 md:px-4 cursor-pointer">
                        <Link to="/shops">
                            View All <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-4 p-6 border border-border rounded-3xl bg-card"
                            >
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2 w-full text-center flex flex-col items-center">
                                    <Skeleton className="h-4 w-2/3 rounded" />
                                    <Skeleton className="h-3 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeShops.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-3xl bg-card">
                        <p className="text-muted-foreground font-semibold">No shops available yet.</p>
                        <Button className="mt-4 bg-primary text-primary-foreground font-bold cursor-pointer" asChild>
                            <Link to="/register">Open Your Shop</Link>
                        </Button>
                    </div>
                ) : (
                    /* Shops Grid */
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {activeShops.map((shop: IShop) => {
                            const fallbackStyle = getFallbackBgColor(shop.name);
                            return (
                                <Link
                                    key={shop._id}
                                    to={`/shops/${shop.slug}`}
                                    className="group flex flex-col items-center gap-4 p-6 border border-border bg-card rounded-3xl shadow-sm hover:border-primary hover:bg-primary/5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                                >
                                    {shop.logo ? (
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                                            <img
                                                src={shop.logo}
                                                alt={shop.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    // Hide image and fall back to initials
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                    const parent = (e.target as HTMLImageElement).parentElement;
                                                    if (parent) {
                                                        const fallbackDiv = document.createElement("div");
                                                        fallbackDiv.className = `w-full h-full flex items-center justify-center font-bold text-lg rounded-full ${fallbackStyle}`;
                                                        fallbackDiv.innerText = shop.name[0].toUpperCase();
                                                        parent.appendChild(fallbackDiv);
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`h-16 w-16 rounded-full border flex items-center justify-center font-bold text-lg shrink-0 ${fallbackStyle}`}>
                                            {shop.name[0].toUpperCase()}
                                        </div>
                                    )}

                                    <div className="text-center w-full space-y-1">
                                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                            {shop.name}
                                        </h3>
                                        
                                        <div className="inline-flex items-center justify-center gap-1 text-xs text-muted-foreground bg-muted/65 group-hover:bg-primary/10 group-hover:text-primary transition-all px-2.5 py-0.5 rounded-full font-medium">
                                            <Store className="h-3 w-3 shrink-0" />
                                            <span>
                                                {shop.totalProducts ?? 0} products
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TopShops;
