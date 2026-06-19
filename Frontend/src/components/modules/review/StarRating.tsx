import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;       // current rating
  max?: number;         // default 5
  size?: "sm" | "md" | "lg" // icon size
  interactive?: boolean // clickable for input
  onChange?: (rating: number) => void
}

const StarRating = ({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < display;
        return (
          <Star
            key={i}
            className={cn(
              size === "sm" && "h-3.5 w-3.5",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-7 w-7",
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/20",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(null)}
            onClick={() => interactive && onChange?.(i + 1)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
