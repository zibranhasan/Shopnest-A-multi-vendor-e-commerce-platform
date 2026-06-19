// src/pages/products/ProductDetails.tsx

import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { ChevronRight, Home, MoveLeft, PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { useGetProductBySlugQuery } from "@/redux/features/product/product.api";
import { useCheckCanReviewQuery } from "@/redux/features/review/review.api";

import ProductGallery from "@/components/modules/products/ProductGallery";
import ProductInfo from "@/components/modules/products/ProductInfo";
import ProductTabs from "@/components/modules/products/ProductTabs";
import RelatedProducts from "@/components/modules/products/RelatedProducts";
import ReviewList from "@/components/modules/review/ReviewList";
import WriteReviewDialog from "@/components/modules/review/WriteReviewDialog";
import type { IProduct } from "@/types/product.type";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────
const ProductDetailsSkeleton = () => (

    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-32 rounded-full" />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-3xl" />
                <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="w-20 aspect-square rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-5 py-2">
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-5 rounded-full" />
                    ))}
                </div>
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                </div>
                <Skeleton className="h-14 w-36 rounded-2xl" />
                <div className="flex gap-3">
                    <Skeleton className="h-12 flex-1 rounded-2xl" />
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                </div>
            </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-64 w-full rounded-3xl" />

        {/* Related Skeleton */}
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-3xl border border-border overflow-hidden">
                        <Skeleton className="aspect-square w-full rounded-none" />
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-5 w-24 rounded-lg" />
                            <div className="flex justify-between">
                                <Skeleton className="h-3 w-20 rounded-full" />
                                <Skeleton className="h-8 w-16 rounded-xl" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Error / Not Found State
// ─────────────────────────────────────────────
const ProductNotFound = ({ slug }: { slug: string }) => (
    <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center text-center gap-6">
            <div className="p-6 rounded-full bg-muted border border-border">
                <PackageSearch className="h-14 w-14 text-muted-foreground" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold text-foreground">Product Not Found</h1>
                <p className="text-muted-foreground text-base max-w-sm">
                    We couldn't find a product matching{" "}
                    <span className="font-mono font-semibold text-foreground">"{slug}"</span>.
                    It may have been removed or the link is incorrect.
                </p>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    asChild
                    className="rounded-xl gap-2"
                    onClick={() => window.history.back()}
                >
                    <button>
                        <MoveLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </Button>
                <Button asChild className="rounded-xl gap-2">
                    <Link to="/products">Browse Products</Link>
                </Button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────
interface BreadcrumbsProps {
    category?: { name: string; slug: string };
    productName: string;
}

const Breadcrumbs = ({ category, productName }: BreadcrumbsProps) => (
    <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
                <Link
                    to="/"
                    className="flex items-center gap-1 hover:text-foreground transition-colors duration-150"
                >
                    <Home className="h-3.5 w-3.5" />
                    Home
                </Link>
            </li>
            <li>
                <ChevronRight className="h-3.5 w-3.5 text-border" />
            </li>
            <li>
                <Link
                    to="/products"
                    className="hover:text-foreground hover:underline underline-offset-2 transition-colors duration-150"
                >
                    Products
                </Link>
            </li>
            {category && (
                <>
                    <li>
                        <ChevronRight className="h-3.5 w-3.5 text-border" />
                    </li>
                    <li>
                        <Link
                            to={`/products?category=${category.slug}`}
                            className="hover:text-foreground hover:underline underline-offset-2 transition-colors duration-150"
                        >
                            {category.name}
                        </Link>
                    </li>
                </>
            )}
            <li>
                <ChevronRight className="h-3.5 w-3.5 text-border" />
            </li>
            <li
                className="text-foreground font-medium max-w-[200px] truncate"
                aria-current="page"
            >
                {productName}
            </li>
        </ol>
    </nav>
);

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const ProductDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: userData } = useUserInfoQuery(undefined);
    const { slug } = useParams<{ slug: string }>();

    const {
        data,
        isLoading,
        isError,
    } = useGetProductBySlugQuery(
        slug ?? "",
        {
            skip: !slug,
        }
    );

    const productDataObj = data?.data as IProduct | undefined;
    const currentUserId = userData?.data?._id;
    const isCustomer = userData?.data?.role === "CUSTOMER";

    const { data: canReviewData } = useCheckCanReviewQuery(
        productDataObj?._id ?? "",
        { skip: !isCustomer || !productDataObj?._id }
    );
    const canReview = canReviewData?.data?.canReview;
    const orderId = canReviewData?.data?.orderId;

    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // ─────────────────────────────────────────
    // Protected Action Handler
    // ─────────────────────────────────────────
    const handleProtectedAction = () => {

        if (!userData?.data?.email) {

            toast.error(
                "Please login first"
            );

            navigate(
                `/login?redirect=${encodeURIComponent(
                    location.pathname
                )}`
            );

            return false;
        }

        return true;
    };

    // Loading
    if (isLoading) {
        return <ProductDetailsSkeleton />;
    }

    const product =
        data?.data as IProduct | undefined;

    // Not Found
    if (isError || !product) {
        return (
            <ProductNotFound
                slug={slug ?? ""}
            />
        );
    }

    return (
        <main className="max-w-[1530px] mx-auto space-y-12 px-4 py-8">

            {/* Breadcrumbs */}
            <Breadcrumbs
                category={product.category}
                productName={product.name}
            />

            {/* Main Product Section */}
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

                {/* Gallery */}
                <ProductGallery
                    images={product.images}
                    productName={product.name}
                />

                {/* Info */}
                <div className="lg:sticky lg:top-24">

                    <ProductInfo
                        product={product}
                        handleProtectedAction={
                            handleProtectedAction
                        }
                    />
                </div>
            </div>

            <Separator />

            {/* Tabs */}
            <ProductTabs
                product={product}
            />

            {/* Reviews Section */}
            <section className="mt-12 border-t pt-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                        Customer Reviews
                    </h2>

                    {/* Write Review Button */}
                    {isCustomer && canReview && (
                        <Button onClick={() => setIsReviewOpen(true)} className="rounded-xl font-bold">
                            Write a Review
                        </Button>
                    )}

                    {/* Already reviewed message */}
                    {isCustomer && !canReview && canReviewData?.data?.reason && (
                        <p className="text-sm font-semibold text-muted-foreground bg-muted/50 px-4 py-2 rounded-xl border border-border/40">
                            {canReviewData.data.reason}
                        </p>
                    )}

                    {/* Not logged in */}
                    {!userData?.data?.email && (
                        <Button variant="outline" asChild className="rounded-xl font-bold">
                            <Link to="/login">Login to Review</Link>
                        </Button>
                    )}
                </div>

                <ReviewList
                    productId={product._id}
                    currentUserId={currentUserId}
                />

                {isReviewOpen && orderId && (
                    <WriteReviewDialog
                        productId={product._id}
                        orderId={orderId}
                        onClose={() => setIsReviewOpen(false)}
                    />
                )}
            </section>

            {/* Related Products */}
            {product.category?._id && (
                <RelatedProducts
                    categoryId={
                        product.category._id
                    }
                    currentProductId={
                        product._id
                    }
                />
            )}
        </main>
    );
};


export default ProductDetails;