"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { CityTile } from "@/features/cities";
import { cn } from "@/lib/utils";

// Two rows of five on desktop.
const VISIBLE_COUNT = 10;

// Figma "Discover by cities" (671:25808): a heading over rows of five 170px
// tiles. The tiles come from the API; on a phone they scroll sideways in two rows.
export function HomeCitiesView({ cities }: { cities: CityTile[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? cities : cities.slice(0, VISIBLE_COUNT);
  const hasMore = cities.length > VISIBLE_COUNT;

  return (
    <section className="w-full overflow-x-clip bg-[#fcfcfc]">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-8 px-6 py-10 lg:gap-[53px] lg:px-32 lg:py-[53px]">
        <h2 className="font-sans text-[32px] font-extrabold leading-[120%] text-[#333134] lg:text-[40px]">
          Discover by cities
        </h2>

        <div className="-mr-6 overflow-x-auto pr-6 lg:mr-0 lg:overflow-visible lg:pr-0">
          <div className="grid grid-flow-col grid-rows-2 gap-6 lg:grid-flow-row lg:grid-cols-5 lg:grid-rows-none">
            {visible.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.id}`}
                aria-label={city.name}
                className="group relative h-[170px] w-[251px] overflow-hidden rounded-2xl bg-muted transition-transform duration-300 hover:-translate-y-1 lg:w-auto"
              >
                <Image
                  src={city.imageSrc}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 251px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/35" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold leading-[30px] whitespace-nowrap text-white">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="-mt-4 hidden items-center gap-2 self-start font-sans text-base font-medium leading-6 text-[#F5032D] transition-opacity hover:opacity-85 lg:flex cursor-pointer"
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
    </section>
  );
}
