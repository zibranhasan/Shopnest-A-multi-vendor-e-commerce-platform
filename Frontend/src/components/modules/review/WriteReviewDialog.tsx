import React, { useState, useEffect } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StarRating from "./StarRating";
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from "@/redux/features/review/review.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface WriteReviewDialogProps {
  productId: string;
  orderId: string;
  reviewId?: string; // If provided, we are in Edit mode
  existingReview?: {
    rating: number;
    comment: string;
    images?: string[];
  };
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Terrible",
  2: "Bad",
  3: "OK",
  4: "Good",
  5: "Excellent",
};

const WriteReviewDialog = ({
  productId,
  orderId,
  reviewId,
  existingReview,
  onClose,
}: WriteReviewDialogProps) => {
  const isEdit = !!reviewId;

  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0);
  const [comment, setComment] = useState<string>(existingReview?.comment ?? "");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();

  const isLoading = isCreating || isUpdating;

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const totalCount = images.length + fileList.length;

    if (totalCount > 3) {
      toast.error("You can upload a maximum of 3 images.");
      return;
    }

    const newImages = [...images, ...fileList];
    setImages(newImages);

    // Create previews
    const newPreviews = fileList.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove selected image
  const removeImage = (idx: number) => {
    // Revoke the object URL to avoid memory leak
    URL.revokeObjectURL(previews[idx]);

    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      newErrors.rating = "Please select a rating.";
    }

    if (comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters long.";
    } else if (comment.length > 500) {
      newErrors.comment = "Comment cannot exceed 500 characters.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      if (isEdit) {
        // Edit mode (PATCH /reviews/:id) - sends rating and comment in JSON
        await updateReview({
          id: reviewId!,
          data: { rating, comment },
        }).unwrap();
        toast.success("Review updated successfully!");
      } else {
        // Create mode (POST /reviews) - sends FormData
        const fd = new FormData();
        fd.append("productId", productId);
        fd.append("orderId", orderId);
        fd.append("rating", String(rating));
        fd.append("comment", comment);
        images.forEach((file) => fd.append("images", file));

        await createReview(fd).unwrap();
        toast.success("Review submitted successfully!");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-3xl gap-5 bg-background border border-border">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Section */}
          <div className="flex flex-col items-center gap-2 py-4 bg-muted/30 rounded-2xl border border-border/40">
            <Label className="text-sm font-semibold text-foreground">Your Rating</Label>
            <StarRating
              rating={rating}
              size="lg"
              interactive={true}
              onChange={(val) => {
                setRating(val);
                setErrors((prev) => ({ ...prev, rating: undefined }));
              }}
            />
            <span className="text-xs font-bold text-amber-500 min-h-[16px]">
              {rating > 0
                ? `${rating} - ${RATING_LABELS[rating]}`
                : "1-Terrible 2-Bad 3-OK 4-Good 5-Excellent"}
            </span>
            {errors.rating && (
              <span className="text-xs font-semibold text-destructive">{errors.rating}</span>
            )}
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment" className="text-sm font-semibold text-foreground">
                Your Comment
              </Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {comment.length}/500
              </span>
            </div>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (errors.comment) {
                  setErrors((prev) => ({ ...prev, comment: undefined }));
                }
              }}
              rows={4}
              maxLength={500}
              className="resize-none rounded-xl border border-border focus-visible:ring-primary"
            />
            {errors.comment && (
              <span className="text-xs font-semibold text-destructive">{errors.comment}</span>
            )}
          </div>

          {/* Photos Upload Section (only for create review) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Add Photos (optional)
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {/* Upload Button */}
                {previews.length < 3 && (
                  <label
                    htmlFor="image-file-upload"
                    className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer group"
                  >
                    <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-semibold text-muted-foreground mt-1 select-none">
                      Upload
                    </span>
                    <input
                      type="file"
                      id="image-file-upload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </label>
                )}

                {/* Previews */}
                {previews.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                  >
                    <img src={url} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-black text-white transition-colors"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Accepts png, jpg, jpeg. Maximum of 3 images.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl px-5 gap-2 font-bold"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewDialog;
