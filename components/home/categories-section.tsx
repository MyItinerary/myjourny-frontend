"use client";

import Link from "next/link";
import { useState } from "react";

import type { Category } from "@/lib/mock-data/home";
import { ChevronDownIcon } from "@/components/icons/shared-icons";

// Figma: "Discover by categories" — guest (2001:8436, top-level categories)
// vs. account (2001:8471, `onboarded=true`: personalized subcategories).
// The pill icon (Ellipse 3822) is a plain colored circle in the design, not
// a distinct vector icon, so it's a decorative dot rather than a fetched
// asset.
const VISIBLE_COUNT = 7;

export function CategoriesSection({
  categories,
  heading = "Discover by categories",
  subheading = "Whatever you're in the mood for, there's a lane for it.",
}: {
  categories: Category[];
  heading?: string;
  subheading?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? categories : categories.slice(0, VISIBLE_COUNT);
  const hasMore = categories.length > VISIBLE_COUNT;

  return (
    // Mobile (2001:9314): left-aligned header, pills wrap inside a fixed
    // 480px-wide block that scrolls horizontally past the screen edge.
    // Desktop (2001:8436/8471): centered header, 900px wrap column.
    <section className="bg-muted px-6 pt-[43px] pb-[74px] lg:px-[306px] lg:pt-[77px] lg:pb-[61px]">
      <div className="mx-auto flex max-w-[1512px] flex-col items-start gap-4 text-left lg:items-center lg:gap-[15px] lg:text-center">
        <h2 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:text-[40px]">{heading}</h2>
        <p className="max-w-[345px] text-lg leading-[28px] text-muted-foreground lg:max-w-[333px] lg:text-xl lg:leading-[30px]">
          {subheading}
        </p>
      </div>

      <div className="-mr-6 overflow-x-auto pr-6 lg:mr-0 lg:overflow-visible lg:pr-0">
        <div className="mx-auto mt-[25px] flex w-[480px] flex-wrap items-start gap-4 lg:mt-[29px] lg:w-auto lg:max-w-[900px]">
        {visible.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 transition-colors hover:border-foreground/20"
          >
            <span aria-hidden className="size-[30px] shrink-0 rounded-full bg-[#e9505b]/70" />
            <span className="text-xl leading-[30px] font-medium whitespace-nowrap text-foreground">
              {category.label}
            </span>
          </Link>
        ))}

          {hasMore ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex items-center gap-2 text-base font-medium text-brand"
            >
              {expanded ? "See less" : "See more"}
              <ChevronDownIcon className={`size-[22px] transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
