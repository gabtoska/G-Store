import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
}

export function RatingStars({ rating }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1 text-brass" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {stars.map((star) => (
        <Star
          key={star}
          className="h-3.5 w-3.5"
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      ))}
    </div>
  );
}
