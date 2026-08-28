import { StarIcon } from "@/components/icons/shared-icons";
import { Button } from "@/components/ui/button";

// itin has no reviews endpoint/field yet — the identical repeated review
// text in the reference screenshots ("I had the best time honestly...",
// same name, same date, 4x) is placeholder content in the design itself.
// `rating` is the one real field available on ExperienceDetail; the
// review count/cards below are static until itin has a reviews feature.
const PLACEHOLDER_REVIEWS = Array.from({ length: 4 }).map((_, i) => ({
  id: i,
  title: "I had the best time honestly",
  body: "I honestly had the best time, the host was friendly and on time. I'd highly recommend",
  name: "Ireti George",
  date: "9 Nov, 2025",
}));

export function ExperienceReviews({ rating }: { rating?: number | null }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <StarIcon className="size-6 fill-brand text-brand" />
        <span className="text-xl font-semibold text-foreground">
          {(rating ?? 4.96).toFixed(2)}
        </span>
        <span className="text-muted-foreground">· {PLACEHOLDER_REVIEWS.length * 42} reviews</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {PLACEHOLDER_REVIEWS.map((review) => (
          <div key={review.id} className="flex flex-col gap-2 rounded-2xl border border-border p-4">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="size-3.5 fill-brand text-brand" />
              ))}
            </div>
            <p className="text-sm font-medium text-foreground">{review.title}</p>
            <p className="text-sm text-muted-foreground">{review.body}</p>
            <p className="text-xs text-muted-foreground">
              {review.name} · {review.date}
            </p>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full rounded-full border-brand text-brand hover:bg-brand/5">
        Show all reviews
      </Button>
    </div>
  );
}
