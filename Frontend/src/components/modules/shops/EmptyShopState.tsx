// src/components/modules/shops/EmptyShopState.tsx

import { Store, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

interface EmptyShopStateProps {
    title?: string;
    subtitle?: string;
    type?: "shops" | "products";
    onClear?: () => void;
}

const EmptyShopState = ({
    title,
    subtitle,
    type = "shops",
    onClear,
}: EmptyShopStateProps) => {
    const isShops = type === "shops";

    const Icon = isShops ? Store : PackageSearch;
    const defaultTitle = isShops ? "No Shops Found" : "No Products Found";
    const defaultSubtitle = isShops
        ? "We couldn't find any shops matching your search. Try different keywords or clear your filters."
        : "This shop has no products yet, or none match your current search.";

    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            {/* Icon container */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted border border-border shadow-sm">
                <Icon className="h-12 w-12 text-muted-foreground/60" />
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
                {title ?? defaultTitle}
            </h2>
            <p className="max-w-sm text-base text-muted-foreground leading-relaxed">
                {subtitle ?? defaultSubtitle}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {onClear && (
                    <Button
                        variant="outline"
                        className="rounded-2xl px-6"
                        onClick={onClear}
                    >
                        Clear Filters
                    </Button>
                )}
                {isShops ? (
                    <Button asChild className="rounded-2xl px-6">
                        <Link to="/">Explore Home</Link>
                    </Button>
                ) : (
                    <Button asChild className="rounded-2xl px-6">
                        <Link to="/shops">Browse All Shops</Link>
                    </Button>
                )}
            </div>
        </div>
    );
};

export default EmptyShopState;
