import Image from "next/image";

import { StarIcon } from "@/components/icons/shared-icons";
import { Button } from "@/components/ui/button";

import type { ExperienceReviewsViewModel, ReviewCard } from "../view-model/use-experience-reviews-view-model";
import { StarRow } from "./star-row";

function ReviewItem({ review }: { review: ReviewCard }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3">
        {review.avatarUrl ? (
          <Image
            src={review.avatarUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-base font-semibold text-[#333134]"
          >
            {review.initial}
          </span>
        )}
        <div>
          <p className="font-sans text-base font-semibold text-[#130404]">{review.author}</p>
          <p className="text-sm text-[#6F6B72]">{review.date}</p>
        </div>
      </div>
      <StarRow rating={review.rating} />
      {review.comment && <p className="whitespace-pre-line text-base text-[#333134]">{review.comment}</p>}
    </li>
  );
}

/** The average, how many reviews, and the written reviews. */
export function ExperienceReviewsView({
  rating,
  countLabel,
  reviews,
  hasMore,
  loadingMore,
  onShowMore,
}: ExperienceReviewsViewModel) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <StarIcon className="size-8 fill-brand text-brand lg:size-10" />
        {rating ? (
          <h2 className="font-sans text-2xl font-semibold text-[#333134] lg:text-[32px]">
            {rating}
            {countLabel && <span className="text-[#6F6B72]">{` · ${countLabel}`}</span>}
          </h2>
        ) : (
          <h2 className="font-sans text-xl font-semibold text-[#333134]">No reviews yet</h2>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      )}

      {hasMore && (
        <Button variant="outline" size="cta" className="self-start" disabled={loadingMore} onClick={onShowMore}>
          {loadingMore ? "Loading…" : "Show more reviews"}
        </Button>
      )}
    </section>
  );
}
