// src/pages/wishlist/Wishlist.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Heart } from "lucide-react";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
    useGetWishlistQuery,
    useRemoveFromWishlistMutation,
} from "@/redux/features/user/user.api";

import WishlistCard from "@/components/modules/wishlist/WishlistCard";
import EmptyWishlist from "@/components/modules/wishlist/EmptyWishlist";
import WishlistSkeleton from "@/components/modules/wishlist/WishlistSkeleton";

export default function Wishlist() {
    const navigate = useNavigate();

    // Check user authenticated profile
    const { data: userData, isLoading: isUserLoading } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    // Fetch wishlist items
    const {
        data: wishlistData,
        isLoading: isWishlistLoading,
        isError,
    } = useGetWishlistQuery(undefined, {
        skip: !isLoggedIn,
    });

    // Remove mutation
    const [removeFromWishlist, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

    // Redirect to login if unauthenticated after profile fetch finishes
    useEffect(() => {
        if (!isUserLoading && !isLoggedIn) {
            toast.error("Please login to view your saved items");
            navigate(`/login?redirect=${encodeURIComponent("/wishlist")}`);
        }
    }, [isLoggedIn, isUserLoading, navigate]);

    // Handle single item deletion
    const handleRemoveItem = async (productId: string) => {
        try {
            await removeFromWishlist(productId).unwrap();
            toast.success("Removed product from your wishlist!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to remove product from wishlist");
        }
    };

    // If still resolving authentication, show standard loading skeleton
    if (isUserLoading || (isLoggedIn && isWishlistLoading)) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-12">
                <WishlistSkeleton />
            </main>
        );
    }

    // In case of error in data load
    if (isError) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
                <div className="text-destructive text-xl font-bold">Failed to load saved items.</div>
                <p className="text-muted-foreground text-sm">Please refresh the page or try again later.</p>
            </main>
        );
    }

    const items = wishlistData?.data || [];
    const hasItems = items.length > 0;

    return (
        <main className="max-w-7xl mx-auto px-4 py-12 space-y-10 min-h-[60vh]">
            {/* Wishlist Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Saved Items
                        </h1>
                        <span className="inline-flex items-center justify-center rounded-full bg-rose-500/10 px-3 py-1 text-sm font-bold text-rose-600 dark:text-rose-400">
                            {items.length} {items.length === 1 ? "item" : "items"}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Your favorite products curated in one place. Add them to cart or keep track of stock updates.
                    </p>
                </div>
            </div>

            {/* Wishlist Body content */}
            {!hasItems ? (
                <EmptyWishlist />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((product: any) => (
                        <div key={product._id} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <WishlistCard
                                product={product}
                                onRemove={handleRemoveItem}
                                isRemoving={isRemoving}
                            />
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
