"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import type { EventDetail } from "../model/event-details.types";
import { TONE_CLASSES } from "./event-tones";

/** Photos of earlier events, in a row to scroll through. */
export function EventPastEventsView({ events }: { events: EventDetail["pastEvents"] }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (direction: 1 | -1) =>
    track.current?.scrollBy({ left: direction * 259, behavior: "smooth" });

  return (
    <section aria-labelledby="past-events" className="mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[77px] lg:px-20 lg:pb-[79px]">
      <div className="flex items-center justify-between gap-4">
        <h2 id="past-events" className="font-sans text-[32px] leading-[120%] font-extrabold text-[#333134] lg:text-[40px] lg:leading-[48px]">
          Past events by this host
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous events"
            onClick={() => scroll(-1)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134]"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next events"
            onClick={() => scroll(1)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-[#F5032D] text-white"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
      <ul
        ref={track}
        className="mt-8 flex snap-x gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {events.map((event) => (
          <li key={event.id} className="flex w-[243px] shrink-0 snap-start flex-col gap-2.5">
            <div
              className={cn(
                "relative h-[200px] overflow-hidden rounded-[20px]",
                TONE_CLASSES[event.tone],
              )}
            >
              {event.imageUrl && (
                <Image src={event.imageUrl} alt="" fill unoptimized sizes="243px" className="object-cover" />
              )}
            </div>
            <p className="font-sans text-[15px] font-medium text-[#333134]">{event.title}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
