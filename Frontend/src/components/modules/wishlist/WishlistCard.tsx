// src/components/modules/wishlist/WishlistCard.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Trash2, Eye, Tag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IProduct } from "@/types/product.type";
import { useAddToCartMutation } from "@/redux/features/cart/cart.api";
import RemoveWishlistDialog from "./RemoveWishlistDialog";

interface WishlistCardProps {
    product: IProduct;
    onRemove: (productId: string) => Promise<void>;
    isRemoving: boolean;
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/f5f5f5/a3a3a3?text=No+Image";

export default function WishlistCard({ product, onRemove, isRemoving }: WishlistCardProps) {
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const displayPrice = product.discountPrice ?? product.price;
    const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
    const imageUrl = product.images?.[0] || FALLBACK_IMAGE;
    const isOutOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) {
            toast.error("This item is currently out of stock");
            return;
        }

        try {
            await addToCart({ productId: product._id, quantity: 1 }).unwrap();
            toast.success("Added to cart! Redirecting to checkout...");
            navigate("/cart");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add to cart");
        }
    };

    const handleConfirmRemove = async () => {
        await onRemove(product._id);
    };

    return (
        <div className="group relative flex flex-col h-full rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            {/* Image Section */}
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
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

                {/* Stock Status Badge Overlay */}
                <div className="absolute top-3 right-3">
                    <Badge
                        variant="secondary"
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full border shadow-sm ${
                            isOutOfStock
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                    >
                        {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                    {/* Category */}
                    {product.category?.name && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Tag className="h-3 w-3 text-primary/70" />
                            {product.category.name}
                        </p>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-sm md:text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                        {product.name}
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Price & Shop */}
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg md:text-xl font-extrabold text-primary">
                                ৳{displayPrice.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-xs md:text-sm text-muted-foreground line-through">
                                    ৳{product.price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {product.shop?.name && (
                            <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[120px]">
                                by {product.shop.name}
                            </span>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/60 w-full" />

                    {/* CTA Actions */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            {/* View Details button */}
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="flex-1 rounded-xl h-9 text-xs font-semibold gap-1.5"
                            >
                                <Link to={`/products/${product.slug}`}>
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                </Link>
                            </Button>

                            {/* Remove button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl h-9 w-9 border-destructive/20 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive transition-colors shrink-0"
                                onClick={() => setDialogOpen(true)}
                                aria-label="Remove from wishlist"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Add to Cart button */}
                        <Button
                            size="sm"
                            className="w-full rounded-xl h-10 text-xs font-bold transition-all duration-200 shadow-md shadow-primary/10"
                            disabled={isOutOfStock || isAddingToCart}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                            {isAddingToCart ? "Adding..." : "Add to Cart"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Remove Confirmation Dialog */}
            <RemoveWishlistDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onConfirm={handleConfirmRemove}
                isLoading={isRemoving}
            />
        </div>
    );
}
