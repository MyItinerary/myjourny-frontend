"use client";

import { BadgeCheck, ChevronDown, MessageCircle, Search, SlidersHorizontal, Star, ThumbsUp } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  type ExperienceReviewsViewModel,
  REVIEW_SORT_LABELS,
  type ReviewRow,
  type ReviewSort,
} from "../view-model/use-experience-reviews-view-model";

const TONES = {
  sand: "bg-[#E9E1D2]",
  blue: "bg-[#DEE8F1]",
  cream: "bg-[#F4F2EE]",
  amber: "bg-[#FFF0D6]",
} as const;

const pill =
  "relative flex h-12 items-center gap-1.5 rounded-full border border-[#E0DFDD] bg-white px-[18px] font-sans text-sm font-medium text-[#333134]";

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-5", i < count ? "fill-[#F5032D] text-[#F5032D]" : "fill-none text-[#E0DFDD]")} />
      ))}
    </span>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[100px] shrink-0 font-sans text-[15px] leading-[22px] text-[#333134]">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#EEEEEE]">
        <span className="block h-full rounded-[3px] bg-[#32070F]" style={{ width: `${(value / 5) * 100}%` }} />
      </span>
      <span className="w-7 shrink-0 text-right font-sans text-[15px] leading-[22px] font-medium text-[#333134]">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Review({ review, onToggleHelpful }: { review: ReviewRow; onToggleHelpful: (id: string) => void }) {
  return (
    <article className="flex flex-col gap-3 border-t border-[#E7E7E7] py-6">
      <header className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full font-sans text-sm font-medium text-[#333134]",
            TONES[review.tone],
          )}
        >
          {review.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="font-sans text-base leading-6 font-medium text-[#333134]">{review.name}</p>
          <p className="flex items-center gap-1.5 font-sans text-[13px] leading-[18px] text-[#6F6B72]">
            {review.date}
            {review.verified && (
              <span className="flex items-center gap-1 text-[#333134]">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified booking
              </span>
            )}
          </p>
        </div>
        <p className="flex items-center gap-1 font-sans text-sm leading-5 font-medium text-[#333134]">
          <Star className="size-4 fill-[#F5032D] text-[#F5032D]" aria-hidden />
          <span aria-label={`${review.rating} out of 5`}>{review.rating}</span>
        </p>
      </header>
      <p className="font-sans text-[15px] leading-6 text-[#333134]">{review.text}</p>
      {review.hostReply && (
        <div className="flex items-start gap-3 rounded-[14px] bg-[#F4F2EE] px-4 py-3.5">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E9E1D2] font-sans text-[11px] font-medium text-[#333134]"
          >
            {review.hostReply.initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 font-sans text-sm text-[#333134]">
            <p className="leading-5 font-medium">{review.hostReply.author}</p>
            <p className="leading-[22px]">{review.hostReply.text}</p>
          </div>
        </div>
      )}
      <footer className="flex items-center gap-4">
        <button
          type="button"
          aria-pressed={review.voted}
          onClick={() => onToggleHelpful(review.id)}
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 font-sans text-sm leading-5",
            review.voted
              ? "bg-[#F4F2EE] font-medium text-[#333134]"
              : "border border-[#E0DFDD] text-[#6F6B72]",
          )}
        >
          <ThumbsUp className="size-4" aria-hidden />
          {review.voted ? `Helpful · ${review.helpfulCount}` : "Was this helpful?"}
        </button>
        <span className="font-sans text-[13px] leading-[18px] text-[#6F6B72]">Report</span>
      </footer>
    </article>
  );
}

/** The reviews block: score and breakdown, the "what people say" summary,
 * search, sort and filter, then the reviews. */
export function ExperienceReviewsView(vm: ExperienceReviewsViewModel) {
  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h2 id="reviews-heading" className="font-heading text-xl font-bold text-foreground">
          Reviews
        </h2>
        <p className="font-sans text-base leading-6 text-[#6F6B72]">{vm.count} reviews</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-16">
          <div className="flex flex-col gap-1.5">
            <p className="font-sans font-extrabold text-[#333134]">
              <span className="text-[56px] leading-none">{vm.average.toFixed(1)}</span>
              <span className="text-xl leading-none font-normal text-[#6F6B72]"> / 5</span>
            </p>
            <Stars count={Math.round(vm.average)} />
            <p className="font-sans text-sm leading-5 text-[#6F6B72]">From {vm.count} reviews</p>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {vm.breakdown.map((row) => (
              <RatingBar key={row.label} {...row} />
            ))}
          </div>
        </div>

        {vm.summary && (
          <div className="flex flex-col gap-2 rounded-2xl bg-[#F4F2EE] p-5">
            <p className="flex items-center gap-2 font-sans text-[15px] leading-[22px] font-medium text-[#333134]">
              <MessageCircle className="size-[18px]" aria-hidden />
              What people say
            </p>
            <p className="font-sans text-[15px] leading-6 text-[#333134]">{vm.summary}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <label className={cn(pill, "min-w-0 flex-1 basis-full cursor-text gap-2 px-4 font-normal sm:basis-0")}>
          <Search className="size-[18px] shrink-0" aria-hidden />
          <input
            type="search"
            value={vm.query}
            onChange={(e) => vm.onQueryChange(e.target.value)}
            placeholder="Search reviews"
            aria-label="Search reviews"
            className="min-w-0 flex-1 bg-transparent font-sans text-[15px] text-[#333134] outline-none placeholder:text-[#6F6B72]"
          />
        </label>
        <label className={cn(pill, "cursor-pointer")}>
          <span>{REVIEW_SORT_LABELS[vm.sort]}</span>
          <ChevronDown className="size-4" aria-hidden />
          <select
            aria-label="Sort reviews"
            value={vm.sort}
            onChange={(e) => vm.onSortChange(e.target.value as ReviewSort)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {Object.entries(REVIEW_SORT_LABELS).map(([value, text]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </label>
        <label className={cn(pill, "cursor-pointer", vm.ratingFilter > 0 && "bg-[#32070F] text-white")}>
          <SlidersHorizontal className="size-4" aria-hidden />
          <span>{vm.ratingFilter > 0 ? `${vm.ratingFilter} stars` : "Filter"}</span>
          <select
            aria-label="Filter by rating"
            value={vm.ratingFilter}
            onChange={(e) => vm.onRatingFilterChange(Number(e.target.value))}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value={0}>All ratings</option>
            {[5, 4, 3, 2, 1].map((stars) => (
              <option key={stars} value={stars}>
                {stars} stars
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col">
        {vm.emptyMessage ? (
          <p className="border-t border-[#E7E7E7] py-6 font-sans text-base text-[#6F6B72]">{vm.emptyMessage}</p>
        ) : (
          vm.rows.map((review) => <Review key={review.id} review={review} onToggleHelpful={vm.onToggleHelpful} />)
        )}
      </div>

      {vm.showMoreLabel && (
        <button
          type="button"
          onClick={vm.onShowMore}
          className="h-12 w-fit cursor-pointer rounded-full border border-[#E0DFDD] px-6 font-sans text-[15px] leading-[22px] font-medium text-[#333134] hover:bg-[#F4F2EE]"
        >
          {vm.showMoreLabel}
        </button>
      )}
    </section>
  );
}
