import { StarIcon } from "@/components/icons/shared-icons";
import { cn } from "@/lib/utils";

/** Five stars, filled up to the rating. Read-only unless onRate is given. */
export function StarRow({
  rating,
  onRate,
  size = "sm",
}: {
  rating: number;
  onRate?: (stars: number) => void;
  size?: "sm" | "lg";
}) {
  const stars = [1, 2, 3, 4, 5];
  const iconClass = size === "lg" ? "size-8" : "size-4";

  if (!onRate) {
    return (
      <div className="flex gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
        {stars.map((star) => (
          <StarIcon
            key={star}
            className={cn(iconClass, star <= rating ? "fill-brand text-brand" : "text-[#E0DFDD]")}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Your rating">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === rating}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onRate(star)}
          className="cursor-pointer rounded-md p-1 focus-visible:outline-2 focus-visible:outline-brand"
        >
          <StarIcon className={cn(iconClass, star <= rating ? "fill-brand text-brand" : "text-[#BDBDBD]")} />
        </button>
      ))}
    </div>
  );
}
