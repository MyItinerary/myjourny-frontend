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
// a left-aligned heading over wrapped pills on a sand band, with "See more" for the rest.
export function CategoryPillsView({ categories, hrefBase, visibleCount = 7 }: CategoryPillsViewProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = visibleCount;
  const visible = expanded ? categories : categories.slice(0, limit);

  if (categories.length === 0) return null;

  return (
    <section aria-label="Discover by categories" className="w-full overflow-x-clip bg-[#f4f2ee]">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col items-start gap-6 px-6 py-12 lg:gap-[34px] lg:px-32 lg:py-[66px]">
        <h2 className="font-sans text-[28px] leading-[120%] font-extrabold text-[#333134]">Discover by categories</h2>

        <div className="flex w-full max-w-[1256px] flex-col items-start gap-3">
          {/* Phones get smaller pills, so more fit on a line; desktop keeps the Figma size. */}
          <div className="flex flex-wrap gap-2.5 lg:gap-4">
            {visible.map((category) => (
              <Link
                key={category.id}
                href={`${hrefBase}/${category.id}`}
                className="flex items-center gap-2 rounded-xl border border-[#E0DFDD] bg-white px-2.5 py-2 transition-all lg:gap-[13px] lg:rounded-[14.783px] lg:p-3 duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs"
              >
                <span aria-hidden className="relative flex size-[22px] shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] lg:size-[27px]">
                  {category.iconSrc ? <Image src={category.iconSrc} alt="" width={21} height={21} className="size-[17px] object-cover lg:size-[21px]" /> : null}
                </span>
                <span className="font-sans text-[15px] leading-[22px] font-medium whitespace-nowrap text-[#333134] lg:text-lg lg:leading-[27px]">{category.label}</span>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="8"
                viewBox="0 0 13 8"
                fill="none"
                aria-hidden
                className={cn("h-[5.5px] w-[11px] shrink-0 transition-transform duration-200", expanded && "rotate-180")}
              >
                <path
                  d="M0.916748 0.916748L6.41675 6.41675L11.9167 0.916748"
                  stroke="#F5032D"
                  strokeWidth="1.83333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
