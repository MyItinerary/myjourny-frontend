"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ExperienceCardVertical } from "@/components/experiences/experience-card-vertical";
import { ExperienceCardVerticalSkeleton } from "@/components/experiences/experience-card-vertical-skeleton";
import type { ExperienceItem } from "@/lib/mock-data/home";

const VISIBLE_COUNT = 16;

// Figma: "Frame 2147226756" (2001:11998 desktop, 4-col grid / 2001:12391
// mobile, single column) + the "Buttons" pagination CTA below it. No
// backend to paginate against, so "See more" reveals the rest of the local
// mock list in place — same expand pattern as CategoriesSection/CitiesSection.
export function CategoryResultsGrid({
  items,
  categoryLabel,
  isLoading = false,
}: {
  items: ExperienceItem[];
  categoryLabel?: string;
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hasMore = !expanded && items.length > VISIBLE_COUNT;

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
          ? Array.from({ length: VISIBLE_COUNT }).map((_, index) => (
              <ExperienceCardVerticalSkeleton key={index} />
            ))
          : visible.map((item) => <ExperienceCardVertical key={item.id} {...item} />)}
      </div>

      {hasMore ? (
        <Button size="cta" onClick={() => setExpanded(true)} className="w-[134px]">
          See more
        </Button>
      ) : null}
    </div>
  );
}
