"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { City } from "@/lib/mock-data/home";
import { cn } from "@/lib/utils";

// Figma: "Discover by cities" (2581:47084 desktop / 2001:9422 mobile). One layout
// everywhere: a left-aligned title (no subtext) between the 80px page margins,
// 5 columns of 170px-tall tiles (10 visible, "See more" expands) on desktop; on
// mobile 2 horizontally-scrollable rows of 251×170 tiles bleeding past the
// screen edge, with no "See more" link.
export function CitiesSection({ cities }: { cities: City[] }) {
  const visibleCount = 10;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cities : cities.slice(0, visibleCount);
  const hasMore = cities.length > visibleCount;

  return (
    <section className="mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[78px] lg:px-20 lg:pb-[27px]">
      <h2 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground">Discover by cities</h2>

      {/* Mobile: 2 rows scrolling horizontally past the screen edge. */}
      <div className="-mr-6 mt-[39px] overflow-x-auto pr-6 lg:mr-0 lg:mt-[75px] lg:overflow-visible lg:pr-0">
        <div
          className={cn(
            "grid grid-flow-col grid-rows-2 gap-x-6 gap-y-[27px] lg:grid-flow-row lg:grid-cols-5 lg:grid-rows-none",
          )}
        >
          {visible.map((city) => {
            const tile = (
              <>
                <Image
                  src={city.imageSrc}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 251px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/35" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold whitespace-nowrap text-white">
                  {city.name}
                </span>
              </>
            );
            const tileClassName =
              "group relative h-[170px] w-[251px] overflow-hidden rounded-2xl bg-muted transition-transform duration-300 hover:-translate-y-1 lg:w-auto";

            return (
              <Link key={city.id} href={`/cities/${city.id}`} aria-label={city.name} className={tileClassName}>
                {tile}
              </Link>
            );
          })}
        </div>
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-[27px] hidden items-center gap-2 font-sans text-base font-medium leading-6 text-[#F5032D] transition-opacity hover:opacity-85 lg:flex cursor-pointer"
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
      ) : null}
    </section>
  );
}
