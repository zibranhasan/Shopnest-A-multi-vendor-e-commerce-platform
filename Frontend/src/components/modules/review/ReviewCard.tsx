import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import StarRating from "./StarRating";
import type { IReview } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReviewCardProps {
  review: IReview;
  currentUserId?: string;
  onEdit?: (review: IReview) => void;
  onDelete?: (reviewId: string) => void;
}

const ReviewCard = ({
  review,
  currentUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) => {
  const { customer, rating, comment, images, createdAt } = review;
  const isOwner = customer._id === currentUserId;
  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstLetter = customer.name.charAt(0).toUpperCase();

  // Color generator for avatar background
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <div className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border bg-background">
            {customer.picture && (
              <AvatarImage
                src={customer.picture}
                alt={customer.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className={`font-bold ${getAvatarBg(customer.name)}`}>
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground leading-none mb-1">
              {customer.name}
            </p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-2">
          <StarRating rating={rating} size="sm" />
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm leading-relaxed text-muted-foreground mb-4 font-medium whitespace-pre-line">
        {comment}
      </p>

      {/* Review Images */}
      {images && images.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mb-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative h-20 w-20 rounded-xl overflow-hidden border border-border/80 bg-muted cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => setActiveImage(img)}
            >
              <img
                src={img}
                alt={`review-${idx}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Owner controls: Edit / Delete */}
      {isOwner && (
        <div className="flex items-center justify-end gap-2 mt-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-3 rounded-xl border-border hover:bg-muted text-xs font-semibold"
              onClick={() => onEdit(review)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 gap-1.5 px-3 rounded-xl text-xs font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-bold">
                    Delete Review?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm">
                    Are you sure you want to delete your review? This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
                    onClick={() => onDelete(review._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Image Modal Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden bg-background border border-border">
            <img
              src={activeImage}
              alt="Review Fullsize"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
