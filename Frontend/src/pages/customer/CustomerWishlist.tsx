// src/pages/customer/CustomerWishlist.tsx

import { useState } from "react";
import { Link } from "react-router";
import { Heart, Trash2, Store, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useGetWishlistQuery, useRemoveFromWishlistMutation } from "@/redux/features/user/user.api";
import { useAddToCartMutation } from "@/redux/features/cart/cart.api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { IProduct } from "@/types/product.type";

const FALLBACK_IMAGE = "https://placehold.co/400x400/f5f5f5/a3a3a3?text=No+Image";

const CustomerWishlist = () => {
    // Auth
    const { data: userData } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    // Queries & Mutations
    const { data: wishlistData, isLoading } = useGetWishlistQuery(undefined, {
        skip: !isLoggedIn,
    });
    const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

    const wishlist: IProduct[] = wishlistData?.data || [];

    // State for removal modal
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

    const handleOpenRemoveDialog = (product: IProduct) => {
        setSelectedProduct(product);
        setIsRemoveDialogOpen(true);
    };

    const handleConfirmRemove = async () => {
        if (!selectedProduct) return;
        try {
            await removeFromWishlist(selectedProduct._id).unwrap();
            toast.success("Item removed from wishlist");
            setIsRemoveDialogOpen(false);
            setSelectedProduct(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove item");
        }
    };

    const handleAddToCart = async (product: IProduct) => {
        try {
            await addToCart({ productId: product._id, quantity: 1 }).unwrap();
            toast.success("Added to cart successfully!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add to cart");
        }
    };

    // Skeletons
    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-40 rounded-xl" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Card key={idx} className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
                            <Skeleton className="aspect-square w-full" />
                            <CardContent className="p-4 space-y-3">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-9 flex-1 rounded-xl" />
                                    <Skeleton className="h-9 w-12 rounded-xl" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (wishlist.length === 0) {
        return (
            <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6 animate-in fade-in duration-300">
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
                    <Heart className="h-9 w-9 text-primary fill-primary/20" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-foreground">
                        Your wishlist is empty
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        Save items you like to buy them later or share them with friends.
                    </p>
                </div>
                <Button asChild className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95">
                    <Link to="/products">
                        Explore Products
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Title with Badge */}
            <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">My Wishlist</h1>
                <Badge variant="secondary" className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25">
                    {wishlist.length}
                </Badge>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {wishlist.map((product) => {
                    const displayPrice = product.discountPrice ?? product.price;
                    const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
                    const imageUrl = product.images?.[0] || FALLBACK_IMAGE;
                    const isOutOfStock = product.stock === 0 || product.status === "OUT_OF_STOCK";
                    const isInactive = product.status !== "ACTIVE";
                    const isCartDisabled = isInactive || isOutOfStock;

                    return (
                        <Card
                            key={product._id}
                            className="group relative flex flex-col  w-full max-w-[360px] rounded-3xl overflow-hidden border border-border/40 bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60 hover:-translate-y-1"
                        >
                            {/* Product Image */}
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
                                    <div className="absolute top-3 left-3 z-10">
                                        <Badge className="bg-destructive text-destructive-foreground font-semibold text-[10px] md:text-xs px-2 py-0.5 md:py-1">
                                            -{product.discountPercent}% Off
                                        </Badge>
                                    </div>
                                )}

                                {/* Remove Button */}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleOpenRemoveDialog(product)}
                                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 hover:bg-destructive/10 hover:text-destructive text-muted-foreground backdrop-blur-md border border-border/40 transition-all z-10 shadow-sm"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                {/* Out of Stock Overlay */}
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                                        <Badge variant="secondary" className="text-xs md:text-sm font-semibold px-3 py-1">
                                            Out of Stock
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                    {/* Category */}
                                    {product.category?.name && (
                                        <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {product.category.name}
                                        </p>
                                    )}

                                    {/* Product Name */}
                                    <h3 className="font-bold text-sm md:text-base leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
                                        {product.name}
                                    </h3>

                                    {/* Shop Name */}
                                    {product.shop?.name && (
                                        <div className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground min-w-0 pt-0.5">
                                            <Store className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                            <span className="truncate font-medium">{product.shop.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-1">
                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-base md:text-lg font-extrabold text-primary">
                                            ৳{displayPrice.toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                                                ৳{product.price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 rounded-xl h-9 text-xs font-bold transition-all duration-200"
                                        >
                                            <Link to={`/products/${product.slug}`}>
                                                View Product
                                            </Link>
                                        </Button>

                                        <Button
                                            size="sm"
                                            disabled={isCartDisabled || isAddingToCart}
                                            onClick={() => handleAddToCart(product)}
                                            className="flex-1 rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center justify-center gap-1.5"
                                        >
                                            {isAddingToCart ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <ShoppingCart className="h-3 w-3" />
                                            )}
                                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Remove Confirmation Dialog */}
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent className="rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Remove from Wishlist</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Are you sure you want to remove this item from your wishlist?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-3 py-4">
                        {selectedProduct && (
                            <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-muted/40 border border-border/30">
                                <img
                                    src={selectedProduct.images?.[0] || FALLBACK_IMAGE}
                                    alt={selectedProduct.name}
                                    className="h-12 w-12 rounded-xl object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-foreground truncate">{selectedProduct.name}</h4>
                                    <p className="text-xs text-muted-foreground truncate">{selectedProduct.shop?.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-0 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRemoveDialogOpen(false)}
                            className="rounded-xl font-bold flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmRemove}
                            disabled={isRemoving}
                            className="rounded-xl font-bold flex-1"
                        >
                            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomerWishlist;
