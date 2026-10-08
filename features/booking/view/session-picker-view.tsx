"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { cn } from "@/lib/utils";

import type { SessionChoice } from "../view-model/use-session-choice";

/** The session times for the chosen day. */
export function SessionTimesView({ scheduled, noSessions, options, onPickSession }: SessionChoice) {
  if (noSessions) {
    return <span className="font-sans text-sm text-[#130404]">No upcoming sessions yet. Check back soon.</span>;
  }
  if (!scheduled) {
    return (
      <span className="font-sans text-sm font-normal text-[#130404]">
        Select your preferred date. The host will confirm the start time with you.
      </span>
    );
  }
  return (
    <>
      <span className="font-sans text-sm font-normal text-[#130404]">
        Select your preferred date and a starting time
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.startsAt}
            type="button"
            disabled={option.disabled}
            aria-pressed={option.selected}
            onClick={() => onPickSession(option.startsAt)}
            className={cn(
              "flex-1 rounded-[12px] border px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
              option.selected
                ? "border-transparent bg-[#2C0101] text-white"
                : "border-[#E0DFDD] bg-white text-[#130404] hover:bg-[#F4F2EE]",
            )}
          >
            {option.label}
            {option.note && <span className="block text-[10px] font-normal">{option.note}</span>}
          </button>
        ))}
      </div>
      <span className="text-xs text-[#6F6B72]">Times are local to the experience.</span>
    </>
  );
}

/** The date button and its dropdown calendar. */
export function SessionDateView({ selectedDate, dateLabel, minDate, isDateSelectable, onSelectDate }: SessionChoice) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 font-sans text-sm text-[#130404]">
          <Calendar className="size-4 text-[#130404]" />
          {dateLabel}
        </span>
        <ChevronDown className="size-4 text-[#130404]" />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[320px] rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <DatePickerCalendar
            selectedDate={selectedDate}
            minDate={minDate}
            isDateEnabled={isDateSelectable}
            presets={computeDatePresets().filter((p) => isDateSelectable(p.date))}
            onSelect={(date) => {
              onSelectDate(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
