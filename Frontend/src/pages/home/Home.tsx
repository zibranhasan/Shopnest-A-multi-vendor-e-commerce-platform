// pages/home/Home.tsx
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Store, Tag } from "lucide-react";

// ============ DUMMY DATA ============
const categories = [
    { id: 1, name: "Electronics", emoji: "📱" },
    { id: 2, name: "Fashion", emoji: "👗" },
    { id: 3, name: "Sports", emoji: "⚽" },
    { id: 4, name: "Books", emoji: "📚" },
    { id: 5, name: "Home & Living", emoji: "🏠" },
    { id: 6, name: "Beauty", emoji: "💄" },
    { id: 7, name: "Toys", emoji: "🧸" },
    { id: 8, name: "Food", emoji: "🍔" },
];

const products = [
    { id: 1, name: "Nike Air Max 2024", price: 4000, discountPrice: 3500, image: "https://placehold.co/300x300", shop: "Rahim Store" },
    { id: 2, name: "H&M T-Shirt", price: 800, discountPrice: null, image: "https://placehold.co/300x300", shop: "Rahim Store" },
    { id: 3, name: "Samsung Galaxy S25", price: 85000, discountPrice: 80000, image: "https://placehold.co/300x300", shop: "Tech Store" },
    { id: 4, name: "Sony Headphones", price: 5000, discountPrice: 4200, image: "https://placehold.co/300x300", shop: "Tech Store" },
    { id: 5, name: "Adidas Shoes", price: 3500, discountPrice: null, image: "https://placehold.co/300x300", shop: "Sports Hub" },
    { id: 6, name: "Levi's Jeans", price: 2500, discountPrice: 2000, image: "https://placehold.co/300x300", shop: "Fashion Store" },
    { id: 7, name: "Apple Watch", price: 45000, discountPrice: 42000, image: "https://placehold.co/300x300", shop: "Tech Store" },
    { id: 8, name: "Running Shoes", price: 2800, discountPrice: null, image: "https://placehold.co/300x300", shop: "Sports Hub" },
];

const shops = [
    { id: 1, name: "Rahim Store", logo: "https://placehold.co/100x100", totalProducts: 25 },
    { id: 2, name: "Tech Store", logo: "https://placehold.co/100x100", totalProducts: 40 },
    { id: 3, name: "Fashion Store", logo: "https://placehold.co/100x100", totalProducts: 30 },
    { id: 4, name: "Sports Hub", logo: "https://placehold.co/100x100", totalProducts: 15 },
    { id: 5, name: "Book World", logo: "https://placehold.co/100x100", totalProducts: 50 },
    { id: 6, name: "Home Decor", logo: "https://placehold.co/100x100", totalProducts: 20 },
];

// ============ HOME PAGE ============
const Home = () => {
    return (
        <div className="space-y-16 pb-16">

            {/* ===== HERO SECTION ===== */}
            <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <Badge variant="outline" className="text-sm">
                        🛒 Bangladesh's #1 Multi-Vendor Store
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Your Home for{" "}
                        <span className="text-primary">Every Shop</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Shop from thousands of vendors across Bangladesh.
                        Best prices, fast delivery, secure payment.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link to="/products">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Shop Now
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link to="/register">
                                <Store className="mr-2 h-5 w-5" />
                                Become a Vendor
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ===== CATEGORIES SECTION ===== */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold">Shop by Category</h2>
                    <p className="text-muted-foreground mt-1">
                        Find what you need
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/products?category=${category.id}`}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                        >
                            <span className="text-3xl">{category.emoji}</span>
                            <span className="text-xs font-medium text-center">
                                {category.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS SECTION ===== */}
            <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Featured Products</h2>
                        <p className="text-muted-foreground mt-1">
                            Handpicked for you
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/products">View All</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            className="group border rounded-xl overflow-hidden hover:shadow-md transition-all"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-3 space-y-1">
                                <p className="text-xs text-muted-foreground">
                                    {product.shop}
                                </p>
                                <h3 className="font-medium text-sm line-clamp-1">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-primary">
                                        ৳{product.discountPrice ?? product.price}
                                    </span>
                                    {product.discountPrice && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            ৳{product.price}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ===== PROMO BANNER ===== */}
            <section className="container mx-auto px-4">
                <div className="bg-primary rounded-2xl p-10 text-center text-primary-foreground space-y-4">
                    <Tag className="h-10 w-10 mx-auto" />
                    <h2 className="text-3xl font-bold">Special Offer!</h2>
                    <p className="text-primary-foreground/80 text-lg">
                        Get up to 20% off on your first order
                    </p>
                    <div className="inline-block bg-white/20 rounded-lg px-6 py-2">
                        <span className="font-mono font-bold text-xl tracking-widest">
                            EID20
                        </span>
                    </div>
                    <div>
                        <Button
                            size="lg"
                            variant="secondary"
                            asChild
                        >
                            <Link to="/products">Shop Now</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ===== FEATURED SHOPS SECTION ===== */}
            <section className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Top Shops</h2>
                        <p className="text-muted-foreground mt-1">
                            Trusted vendors on Shopnest
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/shops">View All</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {shops.map((shop) => (
                        <Link
                            key={shop.id}
                            to={`/shops/${shop.id}`}
                            className="flex flex-col items-center gap-3 p-4 border rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                        >
                            <img
                                src={shop.logo}
                                alt={shop.name}
                                className="w-16 h-16 rounded-full object-cover border"
                            />
                            <div className="text-center">
                                <p className="font-medium text-sm">
                                    {shop.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {shop.totalProducts} products
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default Home;