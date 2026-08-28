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
  isLoading = false,
}: {
  items: ExperienceItem[];
  /** City pages (real data) fetch async — show skeleton cards in the same grid instead of a blank gap while waiting. Static/mock category pages never pass this. */
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hasMore = !expanded && items.length > VISIBLE_COUNT;

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
