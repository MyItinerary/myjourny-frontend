import { BadgeCheck, ThumbsUp } from "lucide-react";
import Image from "next/image";

import { StarIcon } from "@/components/icons/shared-icons";
import { cn } from "@/lib/utils";

import type { AvatarTone } from "../model/reviews.types";
import type { ReviewCard } from "../view-model/use-experience-reviews-view-model";

const TONE_CLASS: Record<AvatarTone, string> = {
  sand: "bg-[#E9E1D2]",
  blue: "bg-[#DEE8F1]",
  cream: "bg-[#F4F2EE]",
  amber: "bg-[#FFF0D6]",
};

function Avatar({ review }: { review: ReviewCard }) {
  if (review.avatarUrl) {
    return (
      <Image src={review.avatarUrl} alt="" width={44} height={44} unoptimized className="size-11 rounded-full object-cover" />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full font-sans text-sm font-medium text-[#333134]",
        TONE_CLASS[review.tone],
      )}
    >
      {review.initials}
    </span>
  );
}

/** One guest review: who, when, rating, text, the host's reply and the helpful vote. */
export function ReviewRowView({
  review,
  onToggleHelpful,
  onToggleExpanded,
}: {
  review: ReviewCard;
  onToggleHelpful: (id: string) => void;
  onToggleExpanded: (id: string) => void;
}) {
  const hostInitials = review.hostReply?.author
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <li className="flex flex-col items-start gap-3 border-t border-[#E7E7E7] py-6">
      <div className="flex w-full items-center gap-3">
        <Avatar review={review} />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-base font-medium leading-6 text-[#333134]">{review.author}</p>
          <p className="flex items-center gap-1.5 text-[13px] leading-[18px] text-[#6F6B72]">
            <span>{review.date}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-[#333134]">
                <BadgeCheck aria-hidden className="size-3.5" />
                Verified booking
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
          <StarIcon aria-hidden className="size-4 fill-brand text-brand" />
          <span aria-hidden className="font-sans text-sm font-medium leading-5 text-[#333134]">
            {review.rating}
          </span>
        </div>
      </div>

      {review.comment && (
        <p className={cn("whitespace-pre-line text-[15px] leading-6 text-[#333134]", review.clamped && "line-clamp-4")}>
          {review.comment}
        </p>
      )}
      {review.comment && review.long && (
        <button
          type="button"
          onClick={() => onToggleExpanded(review.id)}
          className="cursor-pointer font-sans text-[15px] font-medium leading-[22px] text-[#333134] underline"
        >
          {review.clamped ? "Read more" : "Read less"}
        </button>
      )}

      {review.hostReply && (
        <div className="flex w-full items-start gap-3 rounded-[14px] bg-[#F4F2EE] px-4 py-3.5">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E9E1D2] font-sans text-[11px] font-medium text-[#333134]"
          >
            {hostInitials}
          </span>
          <div className="flex flex-col gap-0.5 text-sm text-[#333134]">
            <p className="font-sans font-medium leading-5">Reply from {review.hostReply.author}</p>
            <p className="leading-[22px]">{review.hostReply.text}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-pressed={review.voted}
          onClick={() => onToggleHelpful(review.id)}
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm leading-5",
            review.voted
              ? "bg-[#F4F2EE] font-medium text-[#333134]"
              : "border border-[#E0DFDD] text-[#6F6B72] hover:bg-[#F4F2EE]",
          )}
        >
          <ThumbsUp aria-hidden className="size-4" />
          {review.helpfulCount > 0 ? `Helpful · ${review.helpfulCount}` : "Was this helpful?"}
        </button>
      </div>
    </li>
  );
}
