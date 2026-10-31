"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import type { EventDetail } from "../model/event-details.types";
import { initials, TONE_CLASSES } from "./event-tones";

/** Speakers shown on the page: two rows of three. */
export const LINEUP_PREVIEW = 6;

type People = EventDetail["lineup"];

function People({ people, className }: { people: People; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3", className)}>
      {people.map((person) => (
        <li key={person.id} className="flex flex-col gap-3">
          <div
            className={cn(
              "relative flex aspect-[277/258] items-center justify-center overflow-hidden rounded-[20px]",
              TONE_CLASSES[person.tone],
            )}
          >
            {person.imageUrl ? (
              <Image src={person.imageUrl} alt={person.name} fill unoptimized sizes="277px" className="object-cover" />
            ) : (
              <span aria-hidden className="font-sans text-4xl font-medium text-[#333134]/60">
                {initials(person.name)}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-sans text-[17px] leading-6 font-semibold text-[#333134]">{person.name}</p>
            <p className="font-sans text-sm font-medium text-[#333134]">{person.role}</p>
            <p className="font-sans text-sm leading-[21px] text-[#6F6B72]">{person.bio}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Speakers: a square face, name, role and one line about them. When there
 * are more than the page has room for, "Show all" opens a dialog with everyone. */
export function EventLineupView({ people }: { people: People }) {
  const [open, setOpen] = useState(false);
  const overflow = people.length > LINEUP_PREVIEW;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <People people={overflow ? people.slice(0, LINEUP_PREVIEW) : people} />

      {overflow && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`See more: all ${people.length} speakers`}
          className="w-fit cursor-pointer font-sans text-base font-medium text-[#F5032D] underline underline-offset-2 hover:opacity-85"
        >
          See more
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(18,18,18,0.4)] sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Lineup"
            className="animate-in slide-in-from-bottom flex max-h-[92vh] w-full max-w-[880px] flex-col rounded-t-[24px] bg-white duration-300 sm:rounded-[24px]"
          >
            <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
              <h2 className="font-heading text-2xl font-extrabold text-[#333134] sm:text-[32px]">Lineup</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[#212121] hover:bg-[#F5F5F5]"
              >
                <X className="size-6" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 pb-8 sm:px-8">
              <People people={people} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
