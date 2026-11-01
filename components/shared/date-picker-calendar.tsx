"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DatePickerPreset {
  label: string;
  date: Date;
  /** Range mode: the last day of a multi-day preset like "This weekend". */
  endDate?: Date;
}

export interface DatePickerRange {
  start: Date | null;
  end: Date | null;
}

export interface DatePickerCalendarProps {
  selectedDate: Date | null;
  /** Range mode: two months side by side, the range as a light tint with dark end circles. `onSelect` still fires per click; the caller decides start vs end. */
  range?: DatePickerRange;
  onSelect: (date: Date) => void;
  /** "Today" / "Tomorrow" / "This weekend"-style quick picks, shown above the grid when provided. */
  presets?: DatePickerPreset[];
  /** Range mode: called with the whole preset, so multi-day ones can set both ends. Falls back to `onSelect(preset.date)`. */
  onSelectPreset?: (preset: DatePickerPreset) => void;
  /** Days before this are shown greyed-out and unclickable — both call sites want "no past dates". */
  minDate?: Date;
  /** Only days this returns true for can be picked (e.g. session dates). */
  isDateEnabled?: (date: Date) => boolean;
  className?: string;
}

import { MONTH_NAMES, WEEKDAY_LABELS } from "@/lib/dates";

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
  range,
  onSelect,
  onSelectPreset,
  presets,
  minDate,
  isDateEnabled,
  className,
}: DatePickerCalendarProps) {
  const [viewDate, setViewDate] = useState<Date>(() => {
    const anchor = range?.start ?? selectedDate ?? new Date();
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTH_NAMES[month];
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const minDay = minDate ? startOfDay(minDate) : null;

  if (range) {
    return (
      <RangeMonths
        viewDate={viewDate}
        setViewDate={setViewDate}
        range={range}
        presets={presets}
        minDay={minDay}
        isDateEnabled={isDateEnabled}
        onSelect={onSelect}
        onSelectPreset={onSelectPreset}
        className={className}
      />
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelect(preset.date)}
              className="rounded-full border border-[#E0E0E0] bg-white px-3 py-1 text-center font-sans text-xs font-normal text-[#130404] transition-colors hover:bg-[#F4F2EE] hover:border-brand/40 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex w-full flex-col gap-2 pt-0.5">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center font-sans text-[11px] font-medium leading-4 text-[#6F6B72]">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day} className="py-0.5">
              {day}
            </div>
          ))}
        </div>

        {/* Month header */}
        <div className="flex items-center justify-between py-0.5">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
            className="flex size-7 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE] cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-sans text-sm font-bold text-[#130404]">{monthName} {year}</span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="flex size-7 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE] cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Dates grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8 w-full" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isSelected = !!selectedDate && isSameDay(date, selectedDate);
            const isDisabled =
              (!!minDay && date < minDay) || (!!isDateEnabled && !isDateEnabled(date));
            return (
              <div key={day} className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelect(date)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center text-center font-sans text-xs font-normal transition-colors cursor-pointer",
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

function RangeMonths({
  viewDate,
  setViewDate,
  range,
  presets,
  minDay,
  isDateEnabled,
  onSelect,
  onSelectPreset,
  className,
}: {
  viewDate: Date;
  setViewDate: (date: Date) => void;
  range: DatePickerRange;
  presets?: DatePickerPreset[];
  minDay: Date | null;
  isDateEnabled?: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  onSelectPreset?: (preset: DatePickerPreset) => void;
  className?: string;
}) {
  const today = startOfDay(new Date());
  const months = [viewDate, new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)];
  // A single picked day is both ends until the end date is chosen.
  const start = range.start ? startOfDay(range.start) : null;
  const end = range.end ? startOfDay(range.end) : start;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => (onSelectPreset ? onSelectPreset(preset) : onSelect(preset.date))}
              className="rounded-full bg-[#F1EEEA] px-4 py-2 font-sans text-xs font-medium text-[#1F1C20] transition-colors hover:bg-[#E6E2DC] active:scale-[0.97] cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          aria-label="Previous month"
          className="absolute left-0 top-0 flex size-7 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE] cursor-pointer"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          aria-label="Next month"
          className="absolute right-0 top-0 flex size-7 items-center justify-center rounded-full text-[#130404] transition-colors hover:bg-[#F4F2EE] cursor-pointer"
        >
          <ChevronRight className="size-4" />
        </button>

        {months.map((monthDate, index) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const firstDayOfWeek = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          return (
            <div
              key={`${year}-${month}`}
              className={cn("flex flex-col gap-2", index === 1 && "max-md:hidden")}
            >
              <span className="py-1 text-center font-sans text-sm font-semibold text-[#130404]">
                {MONTH_NAMES[month]} {year}
              </span>
              <div className="grid grid-cols-7 text-center font-sans text-[11px] font-medium leading-4 text-[#6F6B72]">
                {WEEKDAY_LABELS.map((day) => (
                  <div key={day} className="py-0.5">
                    {day.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 w-full" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const isStart = !!start && isSameDay(date, start);
                  const isEnd = !!end && isSameDay(date, end);
                  const inRange = !!start && !!end && date > start && date < end;
                  const hasRange = !!start && !!end && !isSameDay(start, end);
                  const isDisabled =
                    (!!minDay && date < minDay) || (!!isDateEnabled && !isDateEnabled(date));
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex items-center justify-center",
                        (inRange || (hasRange && (isStart || isEnd))) && "bg-[#F1EEEA]",
                        hasRange && isStart && "rounded-l-full",
                        hasRange && isEnd && "rounded-r-full",
                      )}
                    >
                      <button
                        type="button"
                        disabled={isDisabled}
                        aria-pressed={isStart || isEnd}
                        onClick={() => onSelect(date)}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full text-center font-sans text-xs transition-colors cursor-pointer",
                          isStart || isEnd
                            ? "bg-[#1F1C20] font-medium text-white"
                            : isDisabled
                              ? "cursor-not-allowed text-[#CDCDCD]"
                              : "text-[#1F1C20] hover:bg-[#F1EEEA]",
                          !isStart && !isEnd && isSameDay(date, today) && "ring-1 ring-inset ring-[#1F1C20]",
                        )}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
