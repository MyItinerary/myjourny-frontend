"use client";

import Link from "next/link";
import { useState } from "react";

import type { Category } from "@/lib/mock-data/home";

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
    <section className="w-full bg-[#F4F2EE] px-6 py-[43px] lg:px-0 lg:pt-[77px] lg:pb-[61px]">
      <div className="mx-auto flex w-full max-w-[900px] flex-col items-start gap-4 text-left lg:items-start lg:gap-[15px]">
        <h2 className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#333134] lg:text-[40px] lg:leading-[48px]">
          {heading}
        </h2>
        <p className="max-w-[345px] font-sans text-lg font-normal leading-[28px] text-[#6F6B72] lg:max-w-[333px] lg:text-[20px] lg:leading-[30px]">
          {subheading}
        </p>

        <div className="w-full -mr-6 overflow-x-auto pr-6 lg:mr-0 lg:overflow-visible lg:pr-0">
          <div className="mt-[25px] flex w-[480px] flex-wrap items-start gap-4 lg:mt-[29px] lg:w-auto lg:max-w-[900px]">
            {visible.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="flex h-[54px] items-center gap-3 rounded-[14.783px] border border-[#E0DFDD] bg-white p-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xs"
              >
                <span aria-hidden className="size-[30px] shrink-0 rounded-full bg-[#F4F2EE]" />
                <span className="font-sans text-base font-medium leading-6 whitespace-nowrap text-[#130404]">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>

          {hasMore ? (
            <div className="mt-4 flex items-center lg:mt-6">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="flex items-center gap-2 font-sans text-base font-medium leading-6 text-[#F5032D] transition-opacity hover:opacity-85 cursor-pointer"
              >
                <span>{expanded ? "See less" : "See more"}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="8"
                  viewBox="0 0 13 8"
                  fill="none"
                  className={`h-[5.5px] w-[11px] shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
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
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
