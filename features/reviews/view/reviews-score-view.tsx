import { MessageCircle } from "lucide-react";

import { StarIcon } from "@/components/icons/shared-icons";

import type { ReviewsBreakdownRow } from "../view-model/use-experience-reviews-view-model";

/** The average out of 5, stars, review count and the Host / Value / Organisation bars. */
export function ReviewsScoreView({
  rating,
  countLabel,
  breakdown,
}: {
  rating: string;
  countLabel: string | null;
  breakdown: ReviewsBreakdownRow[];
}) {
  const filled = Math.round(Number(rating));
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-16">
      <div className="flex flex-col gap-1.5">
        <p className="font-sans font-extrabold leading-none text-[#333134]">
          <span className="text-[56px]">{rating}</span>
          <span className="text-xl font-normal text-[#6F6B72]"> / 5</span>
        </p>
        <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              aria-hidden
              className={star <= filled ? "size-5 fill-brand text-brand" : "size-5 text-[#E0DFDD]"}
            />
          ))}
        </div>
        {countLabel && <p className="text-sm leading-5 text-[#6F6B72]">From {countLabel}</p>}
      </div>

      {breakdown.length > 0 && (
        <ul className="flex flex-1 flex-col gap-3">
          {breakdown.map((row) => (
            <li key={row.label} className="flex items-center gap-3 text-[15px] leading-[22px] text-[#333134]">
              <span className="w-[100px] shrink-0">{row.label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#EEEEEE]" aria-hidden>
                <span className="block h-full rounded-[3px] bg-[#32070F]" style={{ width: row.width }} />
              </span>
              <span className="w-7 text-right font-medium">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** "What people say": a short written summary of all the reviews. */
export function ReviewsSummaryView({ summary }: { summary: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#F4F2EE] p-5">
      <p className="flex items-center gap-2 font-sans text-[15px] font-medium leading-[22px] text-[#333134]">
        <MessageCircle aria-hidden className="size-[18px]" />
        What people say
      </p>
      <p className="text-[15px] leading-6 text-[#333134]">{summary}</p>
    </div>
  );
}
