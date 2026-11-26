"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { CategoryPill } from "../view-model/use-experiences-page-view-model";

type CategoryPillsViewProps = {
  categories: CategoryPill[];
  /** Where a pill leads: `${hrefBase}/${category id}`. */
  hrefBase: string;
  /** How many pills show before "See more". */
  visibleCount?: number;
};

// Figma "Discover by categories" on the Experiences (2654:61034) and Events (2654:61308) pages:
// a left-aligned heading over wrapped pills on a sand band, with "See more" for the rest. Each pill
// carries its category's icon (2751:6482 for categories, 2751:5903 for subcategories).
export function CategoryPillsView({ categories, hrefBase, visibleCount = 7 }: CategoryPillsViewProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = visibleCount;
  const visible = expanded ? categories : categories.slice(0, limit);

  if (categories.length === 0) return null;

  return (
    <section aria-label="Discover by categories" className="w-full overflow-x-clip bg-[#f4f2ee]">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col items-start gap-8 px-6 py-12 lg:gap-[34px] lg:px-32 lg:py-[66px]">
        <h2 className="font-sans text-[28px] leading-[120%] font-extrabold text-[#333134]">Discover by categories</h2>

        <div className="flex w-full max-w-[1256px] flex-col items-start gap-3">
          <div className="flex flex-wrap gap-2.5">
            {visible.map((category) => (
              <Link
                key={category.id}
                href={`${hrefBase}/${category.id}`}
                className="flex items-center gap-2 rounded-xl border border-[#E0DFDD] bg-white px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs"
              >
                {category.iconSrc ? <Image src={category.iconSrc} alt="" width={30} height={30} unoptimized className="size-5 shrink-0" /> : null}
                <span className="font-sans text-sm leading-5 font-medium whitespace-nowrap text-[#333134] lg:text-[15px] lg:leading-[22px]">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>

          {categories.length > limit ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex cursor-pointer items-center gap-2 font-sans text-base leading-6 font-medium text-[#F5032D] transition-opacity hover:opacity-85"
            >
              <span>{expanded ? "See less" : "See more"}</span>
              <Image
                src="/images/discovery/categories/chevron-down.svg"
                alt=""
                width={22}
                height={22}
                unoptimized
                className={cn("size-[22px] shrink-0 transition-transform duration-200", expanded && "rotate-180")}
              />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
