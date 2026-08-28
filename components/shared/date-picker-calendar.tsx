"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DatePickerPreset {
  label: string;
  date: Date;
}

export interface DatePickerCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  /** "Today" / "Tomorrow" / "This weekend"-style quick picks, shown above the grid when provided. */
  presets?: DatePickerPreset[];
  /** Days before this are shown greyed-out and unclickable — both call sites want "no past dates". */
  minDate?: Date;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Shared "Today / Tomorrow / This weekend" presets — both call sites
// (Hero search bar, booking panel) want the same three, so compute them
// once here instead of duplicating the weekend math.
export function computeDatePresets(): DatePickerPreset[] {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  const weekend = new Date(today);
  weekend.setDate(today.getDate() + daysUntilSaturday);
  return [
    { label: "Today", date: today },
    { label: "Tomorrow", date: tomorrow },
    { label: "This weekend", date: weekend },
  ];
}

// Extracted from the Hero search bar's inline "when" dropdown — presets
// row + weekday header + month grid + prev/next, made generic so the
// booking panel can reuse it too (see plan: mossy-scribbling-dusk.md).
export function DatePickerCalendar({
  selectedDate,
  onSelect,
  presets,
  minDate,
  className,
}: DatePickerCalendarProps) {
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTH_NAMES[month];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minDay = minDate ? startOfDay(minDate) : null;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {presets && presets.length > 0 && (
        <div className="flex items-center gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelect(preset.date)}
              className="rounded-[20px] border border-[#E0E0E0] bg-white px-3 py-0.5 text-center font-sans text-[12px] font-normal leading-[24px] text-[#130404] transition-colors hover:bg-[#F4F2EE]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex w-full flex-col gap-3 pt-1">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center font-sans text-[12px] font-normal leading-4 text-[#6F6B72]">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Month header */}
        <div className="flex items-center justify-between py-1">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            className="flex size-8 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-sans text-base font-bold leading-6 text-[#130404]">{monthName}</span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="flex size-8 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Dates grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 w-full" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isSelected = !!selectedDate && isSameDay(date, selectedDate);
            const isDisabled = !!minDay && date < minDay;
            return (
              <div key={day} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelect(date)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center text-center font-sans text-[14px] font-normal leading-[22px] transition-colors",
                    isSelected
                      ? "rounded-[8px] bg-[#F5032D] font-medium text-white shadow-sm"
                      : isDisabled
                        ? "cursor-not-allowed rounded-[8px] text-[#CDCDCD]"
                        : "rounded-[8px] text-[#333134] hover:bg-[#F4F2EE]"
                  )}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
