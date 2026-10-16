"use client";

import { Fragment, useState } from "react";

import { Button } from "@/components/ui/button";
import { TasteQuizCtaView, useTasteQuizCtaViewModel } from "@/features/taste-quiz-cta";
import { ExperienceCardVertical } from "@/components/experiences/experience-card-vertical";
import { ExperienceCardVerticalSkeleton } from "@/components/experiences/experience-card-vertical-skeleton";
import type { ExperienceItem } from "@/lib/mock-data/home";

const PAGE_SIZE = 16;
// The taste-quiz banner sits after the second row of the 4-col grid.
const TASTE_QUIZ_CTA_AFTER = 8;

// Figma: "Frame 2147226756" (2001:11998 desktop, 4-col grid / 2001:12391
// mobile, single column) + the "Buttons" pagination CTA below it. Shows 16
// cards (4 rows) at a time. By default the button reveals the next 16 of an
// already-loaded list; pass `loadMore` when the caller pages from the server
// instead, and the grid shows every item it's given.
export function CategoryResultsGrid({
  items,
  categoryLabel,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  moreLabel = "See more",
  loadMore,
}: {
  items: ExperienceItem[];
  categoryLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  moreLabel?: string;
  loadMore?: {
    hasMore: boolean;
    isLoading: boolean;
    isError?: boolean;
    onLoadMore: () => void;
  };
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const tasteQuiz = useTasteQuizCtaViewModel();
  const visible = loadMore ? items : items.slice(0, visibleCount);
  const hasMore = loadMore ? loadMore.hasMore : items.length > visibleCount;

  if (isError && items.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-[#e0dfdd] bg-[#FAF9F7] px-6 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#FEE2E2] text-brand">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">
          Failed to load experiences
        </h3>
        <p className="mt-2 max-w-[420px] text-sm text-muted-foreground">
          {errorMessage || "We couldn't load experiences at this moment. Please check your connection and try again."}
        </p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            className="mt-5 rounded-full border-[#e0dfdd] hover:bg-white cursor-pointer"
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-[#e0dfdd] bg-[#FAF9F7] px-6 py-16 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#F4F2EE] text-[#6F6B72]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-foreground">
          No experiences found in {categoryLabel || "this category"}
        </h3>
        <p className="mt-2 max-w-[420px] text-sm text-muted-foreground">
          There are currently no events or experiences listed under this category. Explore other categories or discover exciting activities in popular cities below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 lg:gap-9">
      <div className="grid w-full grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-[34px] lg:gap-y-9">
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <ExperienceCardVerticalSkeleton key={index} />
            ))
          : visible.map((item, index) => (
              <Fragment key={item.id}>
                <ExperienceCardVertical {...item} />
                {index === TASTE_QUIZ_CTA_AFTER - 1 && (
                  <TasteQuizCtaView {...tasteQuiz} className="col-span-full" />
                )}
              </Fragment>
            ))}
      </div>

      {hasMore ? (
        <div className="flex flex-col items-center gap-2">
          <Button
            size="cta"
            disabled={loadMore?.isLoading}
            onClick={() => (loadMore ? loadMore.onLoadMore() : setVisibleCount((n) => n + PAGE_SIZE))}
            className="w-auto min-w-[134px] px-6"
          >
            {loadMore?.isLoading
              ? "Loading..."
              : isError || loadMore?.isError
                ? "Retry loading more"
                : moreLabel}
          </Button>
          {(isError || loadMore?.isError) && (
            <p className="text-xs text-muted-foreground">
              Couldn&apos;t load more experiences. Tap to retry.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
