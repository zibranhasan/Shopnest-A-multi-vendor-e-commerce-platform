// src/components/modules/products/ProductInfo.tsx

import { useState } from "react";
import { Link } from "react-router";
import {
    ShoppingCart,
    Heart,
    Star,
    Store,
    Package,
    Tag,
    CheckCircle2,
    XCircle,
    Clock,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import QuantitySelector from "./QuantitySelector";
import type { IProduct } from "@/types/product.type";
import { useAddToCartMutation, useGetCartQuery } from "@/redux/features/cart/cart.api";
import {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
} from "@/redux/features/user/user.api";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";


interface ProductInfoProps {
    product: IProduct;
    handleProtectedAction: () => boolean;
}

const statusConfig = {
    ACTIVE: {
        label: "In Stock",
        icon: CheckCircle2,
        className: "text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    },
    OUT_OF_STOCK: {
        label: "Out of Stock",
        icon: XCircle,
        className: "text-destructive",
        badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    },
    DRAFT: {
        label: "Unavailable",
        icon: Clock,
        className: "text-muted-foreground",
        badgeClass: "bg-muted text-muted-foreground border-border",
    },
};

const FALLBACK_SHOP_LOGO = "https://placehold.co/40x40/f5f5f5/a3a3a3?text=S";

const ProductInfo = ({ product, handleProtectedAction }: ProductInfoProps) => {
    const [quantity, setQuantity] = useState(1);


    const { data } = useUserInfoQuery(undefined);

    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
    const { data: cartData } = useGetCartQuery(undefined, { skip: !data?.data?.email });
    const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !data?.data?.email });
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    console.log("cartData", cartData?.data);
    console.log("wishlistData", wishlistData?.data)


    const isInCart = cartData?.data?.items?.some(
        (item: any) => item.productId === product._id
    ) ?? false;

    const isWishlisted = wishlistData?.data?.some((item: any) => item._id === product._id) ?? false;

    const maxStock = product.stock || 10;
    const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
    const displayPrice = product.discountPrice ?? product.price;
    const status = product.status ?? "ACTIVE";
    const statusInfo = statusConfig[status] ?? statusConfig.ACTIVE;
    const StatusIcon = statusInfo.icon;
    const isOutOfStock = status === "OUT_OF_STOCK" || product.stock === 0;

    const handleAddToCart = async () => {
        const allowed = handleProtectedAction();
        if (!allowed) return;

        try {
            await addToCart({ productId: product._id, quantity }).unwrap();
            toast.success(`Added ${quantity} item(s) to your cart!`);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add to cart");
        }
    };

    const handleWishlist = async () => {
        const allowed = handleProtectedAction();
        if (!allowed) return;

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
        <div className="space-y-6">
            {/* Category + Status */}
            <div className="flex flex-wrap items-center gap-2">
                {product.category?.name && (
                    <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                    >
                        <Tag className="h-3 w-3 mr-1" />
                        {product.category.name}
                    </Badge>
                )}
                <Badge
                    variant="outline"
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                </Badge>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground lg:text-4xl">
                {product.name}
            </h1>

            {/* Rating */}
            {product.ratings !== undefined && (
                <div className="flex items-center gap-3">
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`h-5 w-5 ${i < Math.round(product.ratings ?? 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-muted text-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                        {product.ratings?.toFixed(1) ?? "0.0"}
                    </span>
                    {product.reviewCount !== undefined && (
                        <span className="text-sm text-muted-foreground">
                            ({product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""})
                        </span>
                    )}
                    {product.sold !== undefined && (
                        <>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground">
                                {product.sold} sold
                            </span>
                        </>
                    )}
                </div>
            )}

            <Separator />

            {/* Pricing */}
            <div className="space-y-1">
                {hasDiscount ? (
                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-4xl font-extrabold text-primary">
                            ৳{displayPrice.toLocaleString()}
                        </span>
                        <span className="text-xl text-muted-foreground line-through">
                            ৳{product.price.toLocaleString()}
                        </span>
                        {product.discountPercent && (
                            <Badge className="bg-destructive text-destructive-foreground font-bold text-sm px-2.5 py-1 rounded-full">
                                -{product.discountPercent}% Off
                            </Badge>
                        )}
                    </div>
                ) : (
                    <span className="text-4xl font-extrabold text-foreground">
                        ৳{product.price.toLocaleString()}
                    </span>
                )}
                <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>

            <Separator />

            {/* Short Description */}
            {product.description && (
                <p className="text-base leading-relaxed text-muted-foreground line-clamp-3">
                    {product.description}
                </p>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Stock:</span>
                <span
                    className={`font-semibold ${product.stock > 10
                        ? "text-emerald-600 dark:text-emerald-400"
                        : product.stock > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-destructive"
                        }`}
                >
                    {product.stock > 0 ? `${product.stock} units` : "Out of stock"}
                </span>
            </div>

            {/* Shop Info */}
            {product.shop?.name && (
                <Link
                    to={`/shops/${product.shop.slug}`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted/80 transition-all duration-200 group"
                >
                    <img
                        src={product.shop.logo || FALLBACK_SHOP_LOGO}
                        alt={product.shop.name}
                        className="h-10 w-10 rounded-full object-cover border border-border bg-background transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_SHOP_LOGO;
                        }}
                    />
                    <div>
                        <p className="text-xs text-muted-foreground">Sold by</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors duration-200">
                            <Store className="h-3.5 w-3.5" />
                            {product.shop.name}
                        </p>
                    </div>
                </Link>
            )}

            <Separator />

            {/* Quantity Selector */}
            {!isOutOfStock && (
                <QuantitySelector
                    quantity={quantity}
                    maxStock={maxStock}
                    onChange={setQuantity}
                />
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    size="lg"
                    variant={isInCart ? "secondary" : isOutOfStock ? "outline" : "default"}
                    className="flex-1 h-12 text-base font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    disabled={isInCart || isOutOfStock || isAddingToCart}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isInCart ? "Already in Cart" : isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                </Button>

                {isInCart && (
                    <Button
                        asChild
                        size="lg"
                        className="flex-1 h-12 text-base font-bold rounded-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    >
                        <Link to="/cart">
                            Go to Cart →
                        </Link>
                    </Button>
                )}

                <Button
                    size="lg"
                    variant="outline"
                    className={`h-12 sm:w-12 sm:px-0 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isWishlisted
                        ? "border-rose-500 text-rose-500 hover:bg-rose-500/10"
                        : "hover:border-rose-400 hover:text-rose-500"
                        }`}
                    onClick={handleWishlist}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    title={isWishlisted ? "Saved" : "Save"}
                >
                    <Heart
                        className={`h-5 w-5 transition-all duration-300 ${isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                            }`}
                    />
                    <span className="ml-2 sm:hidden">
                        {isWishlisted ? "Saved" : "Save"}
                    </span>
                </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                    { emoji: "🔒", label: "Secure Payment" },
                    { emoji: "🔄", label: "Easy Returns" },
                    { emoji: "🚚", label: "Fast Delivery" },
                ].map(({ emoji, label }) => (
                    <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 border border-border text-center"
                    >
                        <span className="text-lg">{emoji}</span>
                        <span className="text-xs font-medium text-muted-foreground leading-tight">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductInfo;
