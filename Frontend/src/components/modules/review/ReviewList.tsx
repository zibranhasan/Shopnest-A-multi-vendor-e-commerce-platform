import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ReviewSummary from "./ReviewSummary";
import ReviewCard from "./ReviewCard";
import WriteReviewDialog from "./WriteReviewDialog";
import {
  useGetProductReviewsQuery,
  useDeleteReviewMutation,
} from "@/redux/features/review/review.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { IReview } from "@/types";

interface ReviewListProps {
  productId: string;
  currentUserId?: string;
}

// ─────────────────────────────────────────────
// Skeletal Placeholders for Reviews Loading
// ─────────────────────────────────────────────
const ReviewCardSkeleton = () => (
  <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-3 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-24 rounded-lg" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-20 w-20 rounded-xl" />
      <Skeleton className="h-20 w-20 rounded-xl" />
    </div>
  </div>
);

const ReviewList = ({ productId, currentUserId }: ReviewListProps) => {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: responseData, isLoading } = useGetProductReviewsQuery({
    productId,
    page,
    limit,
  });

  const [deleteReview] = useDeleteReviewMutation();
  const [editingReview, setEditingReview] = useState<IReview | null>(null);

  const reviews = responseData?.data?.data || [];
  const meta = responseData?.data?.meta;
  const breakdown = responseData?.data?.breakdown || [];
  const avgRating = responseData?.data?.avgRating || 0;
  const totalReviews = responseData?.data?.totalReviews || 0;

  const totalPages = meta?.totalPage || 1;

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id).unwrap();
      toast.success("Review deleted successfully!");

      // If we are deleting the last item on the page, go back a page
      if (reviews.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-3xl bg-muted/40 border border-border/60">
          <div className="flex flex-col items-center justify-center p-4">
            <Skeleton className="h-14 w-16 rounded-xl mb-3" />
            <Skeleton className="h-6 w-32 rounded-lg mb-2" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
          <div className="col-span-2 space-y-3.5 flex flex-col justify-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Skeleton className="h-4 w-8 rounded-md" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Card Skeletons */}
        <div className="space-y-4">
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
          <ReviewCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {totalReviews > 0 ? (
        <>
          {/* Summary Section */}
          <ReviewSummary
            summary={{
              avgRating,
              totalReviews,
              breakdown,
            }}
          />

          {/* Reviews Cards List */}
          <div className="space-y-4">
            {reviews.map((review: IReview) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={currentUserId}
                onEdit={(rev) => setEditingReview(rev)}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-9 w-9 rounded-xl font-bold"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed border-border bg-muted/10 space-y-4">
          <div className="p-4 rounded-full bg-muted/40 border border-border">
            <Star className="h-8 w-8 text-amber-500 fill-amber-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-foreground">No Reviews Yet</h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Be the first to share your thoughts and help others make a choice!
            </p>
          </div>
        </div>
      )}

      {/* Edit Review Dialog Overlay */}
      {editingReview && (
        <WriteReviewDialog
          productId={productId}
          orderId={editingReview.order}
          reviewId={editingReview._id}
          existingReview={{
            rating: editingReview.rating,
            comment: editingReview.comment,
            images: editingReview.images,
          }}
          onClose={() => setEditingReview(null)}
        />
      )}
    </div>
  );
};

export default ReviewList;
