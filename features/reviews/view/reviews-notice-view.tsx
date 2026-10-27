import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

function Notice({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl bg-[#F4F2EE] p-5">
      <p className="flex items-center gap-2 font-sans text-[15px] font-medium leading-[22px] text-[#333134]">
        <MessageCircle aria-hidden className="size-[18px]" />
        {title}
      </p>
      <p className="text-[15px] leading-6 text-[#333134]">{children}</p>
      {action}
    </div>
  );
}

export function EarlyReviewsNotice() {
  return (
    <Notice title="Early reviews">
      This experience is new, so there are only a few reviews so far. We show every one of them.
    </Notice>
  );
}

export function NewListingNotice() {
  return (
    <Notice title="No reviews yet">
      Reviews appear here once guests have been on this experience. Book it and be one of the first.
    </Notice>
  );
}

export function ReviewsErrorNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <Notice
      title="We could not load the reviews"
      action={
        <Button variant="outline" size="cta" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      Something went wrong on our side. Check your connection and try again.
    </Notice>
  );
}

export function NoResultsNotice({ onClear }: { onClear: () => void }) {
  return (
    <Notice
      title="No reviews match"
      action={
        <Button variant="outline" size="cta" onClick={onClear}>
          Clear search and filters
        </Button>
      }
    >
      Try a different word, or remove a filter.
    </Notice>
  );
}

/** Placeholder rows while the reviews load. */
export function ReviewsSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading reviews" className="flex animate-pulse flex-col">
      {[0, 1, 2].map((row) => (
        <li key={row} className="flex flex-col gap-3 border-t border-[#E7E7E7] py-6">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-full bg-[#EEEEEE]" />
            <span className="flex flex-col gap-2">
              <span className="h-4 w-28 rounded bg-[#EEEEEE]" />
              <span className="h-3 w-40 rounded bg-[#EEEEEE]" />
            </span>
          </div>
          <span className="h-4 w-full rounded bg-[#EEEEEE]" />
          <span className="h-4 w-2/3 rounded bg-[#EEEEEE]" />
        </li>
      ))}
    </ul>
  );
}
