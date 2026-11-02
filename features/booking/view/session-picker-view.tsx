"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import type { SessionChoice } from "../view-model/use-session-choice";
import { BookingCalendarView } from "./booking-calendar-view";
import { PillRow } from "./booking-card-parts";

/** The date row and, opened, its calendar. `openRef` lets a notice open it from outside. */
export function SessionDateView({
  sessions,
  label,
  locked = false,
  open,
  onOpenChange,
}: {
  sessions: SessionChoice;
  /** What the field says: the day and how long it runs. */
  label: string;
  locked?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className={cn("flex flex-col gap-3", locked && "opacity-60")}>
      <button
        type="button"
        disabled={locked}
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-label={`Date: ${label}`}
        className="w-full cursor-pointer text-left disabled:cursor-not-allowed"
      >
        <PillRow className="px-4 py-3">
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <Calendar aria-hidden className="size-6 shrink-0 text-[#333134]" />
            <span className="truncate text-base leading-6 text-[#333134]">{label}</span>
          </span>
          <ChevronDown aria-hidden className={cn("size-6 shrink-0 text-[#333134] transition-transform", open && "rotate-180")} />
        </PillRow>
      </button>
      {open && (
        <BookingCalendarView
          selectedDate={sessions.selectedDate}
          endDate={sessions.endDate}
          minDate={sessions.minDate}
          isDateSelectable={sessions.isDateSelectable}
          dayState={sessions.dayState}
          onSelectDate={(date) => {
            sessions.onSelectDate(date);
            onOpenChange(false);
          }}
        />
      )}
    </div>
  );
}

/** "Choose a time" and the chips for the chosen day: loading, empty, or the times. */
export function SessionTimesView({ sessions, locked = false }: { sessions: SessionChoice; locked?: boolean }) {
  const { scheduled, noSessions, allSoldOut, options, loading, dayStatus, nextOpen, onJumpToNext, singleTime, timezoneNote } = sessions;
  // Without a schedule only the date is picked; the host sets the time.
  if (!scheduled && !loading) return null;
  // One time on the day: nothing to pick. The date field names it; say which zone it's in.
  if (singleTime && !loading) return <p className="text-xs text-[#6F6B72]">{timezoneNote}</p>;
  if (noSessions && !loading) return <p className="text-sm text-[#6F6B72]">No upcoming sessions yet. Check back soon.</p>;
  if (allSoldOut && options.length === 0 && !loading) return <p className="text-sm text-[#6F6B72]">All upcoming sessions are sold out.</p>;

  return (
    <div className={cn("flex flex-col gap-2 pt-1", locked && "opacity-60")}>
      <p className="flex items-baseline justify-between gap-2 text-sm font-medium text-[#333134]">
        Choose a time
        <span className="text-xs font-normal text-[#6F6B72]">{timezoneNote}</span>
      </p>
      {loading ? (
        <div className="flex gap-2" aria-busy="true" aria-label="Loading times">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-11 flex-1 animate-pulse rounded-[10px] bg-[#F5F5F5]" />
          ))}
        </div>
      ) : dayStatus === "empty" ? (
        <p className="flex items-center justify-between rounded-[10px] border border-[#E7E7E7] px-3.5 py-3 text-sm text-[#6F6B72]">
          No times on this day.
          {nextOpen && (
            <button type="button" onClick={onJumpToNext} className="cursor-pointer font-medium text-[#333134] underline">
              Try {nextOpen.shortLabel}
            </button>
          )}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.startsAt}
              type="button"
              disabled={option.disabled || locked}
              aria-pressed={option.selected}
              onClick={() => sessions.onPickSession(option.startsAt)}
              className={cn(
                "h-11 min-w-[88px] flex-1 cursor-pointer rounded-[10px] text-base transition-colors disabled:cursor-not-allowed",
                option.selected
                  ? "bg-[#32070F] text-white"
                  : option.disabled
                    ? "bg-[#F5F5F5] text-[#BDBDBD] line-through"
                    : "border border-[#E7E7E7] bg-white text-[#333134] hover:bg-[#F4F2EE]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
