// src/components/modules/products/ProductCard.tsx

import { Link, useNavigate, useLocation } from "react-router";
import { ShoppingCart, Star, Store, Heart } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IProduct } from "@/types/product.type";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useAddToCartMutation, useGetCartQuery } from "@/redux/features/cart/cart.api";

import {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} from "@/redux/features/user/user.api";


interface ProductCardProps {
    product: IProduct;
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/f5f5f5/a3a3a3?text=No+Image";

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const { data } = useUserInfoQuery(undefined);
    const isLoggedIn = !!data?.data?.email;  // ← use data not user

    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const { data: cartData } = useGetCartQuery(undefined, { skip: !data?.data?.email });
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !data?.data?.email });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    const isInCart = cartData?.data?.items?.some(
        (item: any) => item.productId === product._id
    ) ?? false;

    const isWishlisted = wishlistData?.data?.some((item: any) => item._id === product._id) ?? false;

    const displayPrice = product.discountPrice ?? product.price;
    const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
    const imageUrl = product.images?.[0] || FALLBACK_IMAGE;
    const isOutOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            toast.error("Please login to add items to cart");
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }

        try {
            await addToCart({ productId: product._id, quantity: 1 }).unwrap();
            toast.success("Added to cart successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add to cart");
        }
    };

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            toast.error("Please login to manage your wishlist");
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }

        try {
            if (isWishlisted) {
                await removeFromWishlist(product._id).unwrap();
                toast.success("Removed from wishlist");
            } else {
                await addToWishlist({ productId: product._id }).unwrap();
                toast.success("Added to wishlist");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update wishlist");
        }
    };

    return (

        <Link
            to={`/products/${product.slug}`}
            className="group block rounded-3xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`View ${product.name}`}
        >
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

                {/* Discount Badge */}
                {hasDiscount && product.discountPercent && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-destructive text-destructive-foreground font-semibold text-xs px-2 py-1">
                            -{product.discountPercent}% Off
                        </Badge>
                    </div>
                )}

                {/* Wishlist Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-background/85 backdrop-blur-md shadow-sm border border-border/55 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 z-10 ${isWishlisted ? "text-rose-500 hover:bg-rose-100" : "text-muted-foreground"
                        }`}
                    onClick={handleWishlistToggle}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Saved" : "Save"}
                >
                    <Heart className={`h-4 w-4 transition-transform duration-300 ${isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : "hover:scale-110"}`} />
                </Button>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                            Out of Stock
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-wider text-muted-foreground font-medium">
                        {product.category?.name}
                    </span>

                    {product.shop?.name && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Store className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">
                                {product.shop.name}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">
                        {product.name}
                    </h3>

                    <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-primary">
                            ৳{displayPrice.toLocaleString()}
                        </div>

                        {hasDiscount && (
                            <div className="text-xs text-muted-foreground line-through">
                                ৳{product.price.toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>


                {/* Rating */}
                {product.ratings !== undefined && product.ratings > 0 && (
                    <div className="flex items-center gap-1.5">
                        <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < Math.round(product.ratings!)
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-muted text-muted"
                                        }`}
                                />
                            ))}
                        </div>
                        {product.reviewCount !== undefined && (
                            <span className="text-xs text-muted-foreground">
                                ({product.reviewCount})
                            </span>
                        )}
                    </div>
                )}





                {/* CTA Buttons */}
                <div className="space-y-2 pt-2 w-full">
                    <div className="flex gap-2 items-center">
                        <Button
                            size="sm"
                            variant={isInCart ? "secondary" : "default"}
                            className="flex-1 shrink-0 rounded-xl h-9 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isInCart || isOutOfStock || isAddingToCart}
                            onClick={handleAddToCart}
                            aria-label={isInCart ? `${product.name} already in cart` : `Add ${product.name} to cart`}
                        >
                            <ShoppingCart className={`h-3.5 w-3.5 mr-1 ${isInCart ? "text-muted-foreground/60 animate-none" : ""}`} />
                            {isAddingToCart ? "Adding..." : isInCart ? "Already in Cart" : "Add to Cart"}
                        </Button>

                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="rounded-xl h-9 px-3 text-xs font-bold hover:bg-muted-foreground/10 transition-all duration-200"
                        >
                            <Link
                                to={`/products/${product.slug}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                View
                            </Link>
                        </Button>
                    </div>

                    {isInCart && (
                        <div className="text-center pt-0.5">
                            <Link
                                to="/cart"
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-primary hover:underline font-semibold"
                            >
                                View in Cart →
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </Link>
    );
};

export default ProductCard;
