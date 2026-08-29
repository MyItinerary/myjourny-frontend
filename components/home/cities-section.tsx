"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { City } from "@/lib/mock-data/home";
import { cn } from "@/lib/utils";

// Figma: "Discover by cities". Three layouts share this component:
// - Homepage desktop (2001:9148): 900px column, 4 cols of 207×170, 8
//   visible, left-aligned header, "See more" expand.
// - Category desktop (2001:12259): 1213px column, 5 cols of 223×170, 10
//   visible, CENTERED header, "See more" expand.
// - Mobile (2001:9422): 2 horizontally-scrollable rows of 251×170 tiles
//   bleeding past the screen edge; no "See more" link.
// Tile height is a fixed 170px everywhere — only the width changes.
export function CitiesSection({
  cities,
  variant = "home",
  isAccount = false,
}: {
  cities: City[];
  variant?: "home" | "category";
  /** Tiles only link to /cities/{id} when true — that page has nothing real to show a guest (same login-gate as the rest of the real homepage data). */
  isAccount?: boolean;
}) {
  const visibleCount = variant === "category" ? 10 : 8;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cities : cities.slice(0, visibleCount);
  const hasMore = cities.length > visibleCount;

  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[78px] lg:pb-[27px]",
        variant === "category" ? "lg:px-[150px]" : "lg:px-[306px]"
      )}
    >
      {/* Homepage keeps the heading left-aligned; the category page centers it. */}
      <div
        className={cn(
          "flex flex-col gap-[10px] lg:gap-4",
          variant === "category" && "lg:items-center lg:text-center"
        )}
      >
        <h2 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:text-[40px]">
          Discover by cities
        </h2>
        <p className="text-lg leading-[28px] text-muted-foreground lg:text-xl lg:leading-[30px]">
          Every city has its own rhythm. Find yours.
        </p>
      </div>

      {/* Mobile: 2 rows scrolling horizontally past the screen edge. */}
      <div className="-mr-6 mt-[39px] overflow-x-auto pr-6 lg:mr-0 lg:mt-[75px] lg:overflow-visible lg:pr-0">
        <div
          className={cn(
            "grid grid-flow-col grid-rows-2 gap-x-6 gap-y-[27px] lg:grid-flow-row lg:grid-rows-none",
            variant === "category" ? "lg:grid-cols-5" : "lg:grid-cols-4"
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

            return isAccount ? (
              <Link key={city.id} href={`/cities/${city.id}`} className={tileClassName}>
                {tile}
              </Link>
            ) : (
              <div key={city.id} className={tileClassName}>
                {tile}
              </div>
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
