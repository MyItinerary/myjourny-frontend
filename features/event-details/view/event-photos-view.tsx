"use client";

import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { TONE_CLASSES } from "./event-tones";

const PLACEHOLDERS = [
  { tone: 1, className: "row-span-2" },
  { tone: 2, className: "" },
  { tone: 3, className: "" },
  { tone: 4, className: "" },
  { tone: 5, className: "" },
] as const;

/** Stands in for the event's photos until the organiser has uploaded some,
 * in the same layouts as the real gallery: a swipeable strip with a counter on
 * small screens, a five-tile grid on large ones. */
export function EventPhotosView() {
  const [slide, setSlide] = useState(0);
  return (
    <>
      <div data-testid="event-photo-strip" className="relative lg:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const strip = event.currentTarget;
            if (strip.clientWidth > 0) setSlide(Math.round(strip.scrollLeft / strip.clientWidth));
          }}
        >
          {PLACEHOLDERS.map(({ tone }) => (
            <div key={tone} className={cn("aspect-[4/3] w-full shrink-0 snap-center", TONE_CLASSES[tone])} />
          ))}
        </div>
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {slide + 1} / {PLACEHOLDERS.length}
        </span>
      </div>

      <div
        data-testid="event-photo-placeholders"
        className="relative hidden h-[479px] grid-cols-3 grid-rows-2 gap-4 lg:grid"
      >
        {PLACEHOLDERS.map(({ tone, className }) => (
          <div key={tone} className={cn("rounded-[20px]", TONE_CLASSES[tone], className)} />
        ))}
        {/* Nothing to open until the organiser uploads photos. */}
        <button
          type="button"
          disabled
          className="absolute right-3 bottom-3 flex h-[37px] items-center gap-2 rounded-full bg-white px-2 font-sans text-[14px] font-medium text-[#333134] opacity-80 shadow-sm"
        >
          <ImageIcon className="size-5" />
          View all
        </button>
      </div>
    </>
  );
}
