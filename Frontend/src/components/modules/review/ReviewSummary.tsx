import StarRating from "./StarRating";
import type { IReviewSummary } from "@/types";

interface ReviewSummaryProps {
  summary: IReviewSummary;
}

const ReviewSummary = ({ summary }: ReviewSummaryProps) => {
  const { avgRating, totalReviews, breakdown } = summary;

  // Map aggregate breakdown to a dictionary to handle missing star counts
  const countsMap = new Map(breakdown.map((item) => [item._id, item.count]));
  const starLevels = [5, 4, 3, 2, 1];

  const getProgressBarColor = (star: number) => {
    if (star >= 4) return "bg-gradient-to-r from-amber-400 to-yellow-500";
    if (star === 3) return "bg-gradient-to-r from-orange-400 to-amber-500";
    return "bg-gradient-to-r from-rose-500 to-red-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-3xl bg-muted/40 border border-border/60">
      {/* Left side: Big Average Rating & Stars */}
      <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-border/50">
        <h3 className="text-6xl font-black tracking-tight text-foreground">
          {avgRating.toFixed(1)}
        </h3>
        <div className="my-3">
          <StarRating rating={avgRating} size="lg" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          out of 5 · {totalReviews} review{totalReviews !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Right side: Star Distribution Bars */}
      <div className="col-span-1 md:col-span-2 flex flex-col justify-center space-y-3.5">
        {starLevels.map((star) => {
          const count = countsMap.get(star) || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          const colorClass = getProgressBarColor(star);

          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-8 font-semibold text-foreground text-right">{star}★</span>
              <div className="flex-1 h-3 rounded-full bg-muted/80 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-left tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSummary;
