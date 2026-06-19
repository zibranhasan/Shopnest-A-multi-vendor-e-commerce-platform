import { Link } from "react-router";
import { ShoppingBag, Store, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetAllProductsQuery } from "@/redux/features/product/product.api";

const HeroSection = () => {
    // Fetch 4 products for the visual floating showcase
    const { data: productsData, isLoading } = useGetAllProductsQuery({ limit: 4, sort: "-createdAt" });
    const products = productsData?.data || [];

    return (
        <section className="relative min-height-[70vh] flex items-center overflow-hidden py-12 md:py-24 bg-gradient-to-b from-primary/10 via-background to-background">
            {/* Background Decorative Blobs */}
            <div className="absolute top-1/4 left-1/12 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-bounce duration-10000" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-left-6 duration-700">
                        <Badge variant="secondary" className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-primary border border-primary/20 rounded-full text-sm font-semibold tracking-wide">
                            <span className="animate-ping inline-block w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                            🛒 Bangladesh's #1 Multi-Vendor Store
                        </Badge>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
                            Your Home for <br className="hidden md:inline" />
                            <span className="text-primary bg-clip-text">Every Shop</span>
                        </h1>

                        <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
                            Discover thousands of products from verified vendors across Bangladesh. 
                            Best prices, secure payments, and reliable delivery right to your doorstep.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                <Link to="/products" className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5" />
                                    Shop Now
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" asChild className="border-border hover:bg-muted font-bold px-8 py-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                <Link to="/register" className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-primary" />
                                    Become a Vendor
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-6 border-t border-border/60">
                            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2 font-medium">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                                    Secure Payment
                                </span>
                                <span className="flex items-center gap-2 font-medium">
                                    <Truck className="h-5 w-5 text-primary shrink-0" />
                                    Fast Delivery
                                </span>
                                <span className="flex items-center gap-2 font-medium">
                                    <RotateCcw className="h-5 w-5 text-blue-500 shrink-0" />
                                    Easy Returns
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visual Showcase */}
                    <div className="lg:col-span-5 relative w-full flex items-center justify-center animate-in fade-in slide-in-from-right-6 duration-700 delay-100">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-[450px]">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-2xl border border-border" />
                                ))}
                            </div>
                        ) : products.length >= 2 ? (
                            <div className="relative w-full max-w-[450px] aspect-square grid grid-cols-2 gap-4">
                                {products.map((product: any, idx: number) => {
                                    // Make cards floating offset
                                    const offsets = [
                                        "-translate-y-2 hover:-translate-y-4",
                                        "translate-y-2 hover:translate-y-0",
                                        "-translate-y-1 hover:-translate-y-3",
                                        "translate-y-3 hover:translate-y-1"
                                    ];
                                    return (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className={`group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-500 ${offsets[idx]} hover:shadow-xl`}
                                        >
                                            <img
                                                src={product.images?.[0] || "https://placehold.co/300x300"}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                                                <p className="text-white text-xs font-semibold uppercase tracking-wider text-primary truncate">
                                                    {product.category?.name}
                                                </p>
                                                <h4 className="text-white text-sm font-bold truncate">
                                                    {product.name}
                                                </h4>
                                                <p className="text-primary font-black text-sm">
                                                    ৳{product.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            // Fallback premium glassmorphic display cards if no products loaded
                            <div className="relative w-full max-w-[400px] aspect-[4/3] relative">
                                <div className="absolute top-0 left-0 w-3/4 aspect-square rounded-2xl bg-gradient-to-br from-primary/30 to-orange-500/10 border border-primary/20 backdrop-blur-md shadow-lg rotate-[-6deg] flex flex-col justify-between p-6">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">⚡</div>
                                    <div>
                                        <div className="w-1/2 h-4 bg-foreground/15 rounded-md mb-2" />
                                        <div className="w-3/4 h-3 bg-foreground/10 rounded-md" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3/4 aspect-square rounded-2xl bg-gradient-to-tr from-orange-400/20 to-primary/40 border border-primary/30 backdrop-blur-lg shadow-xl rotate-[8deg] flex flex-col justify-between p-6 z-10">
                                    <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-2xl">🛍️</div>
                                    <div>
                                        <div className="w-2/3 h-4 bg-foreground/20 rounded-md mb-2" />
                                        <div className="w-1/2 h-3 bg-foreground/15 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
