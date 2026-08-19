"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons/shared-icons";

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
}: {
  cities: City[];
  variant?: "home" | "category";
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
          {visible.map((city) => (
            <div key={city.id} className="relative h-[170px] w-[251px] overflow-hidden rounded-2xl bg-muted lg:w-auto">
              <Image src={city.imageSrc} alt="" fill sizes="(min-width: 1024px) 25vw, 251px" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-black/20" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold whitespace-nowrap text-white">
                {city.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-[27px] hidden items-center gap-2 text-base font-medium text-brand lg:flex"
        >
          {expanded ? "See less" : "See more"}
          <ChevronDownIcon className={`size-[22px] transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </section>
  );
}
