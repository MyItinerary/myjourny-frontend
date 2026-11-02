"use client";

import { computeDatePresets, DatePickerCalendar, type DatePickerPreset } from "@/components/shared/date-picker-calendar";
import { cn } from "@/lib/utils";

export interface DateRangePanelProps {
  /** The range being picked. Nothing is applied until Apply. */
  range: { start: Date | null; end: Date | null };
  /** A day was tapped: the first tap sets the start, the second the end. */
  onPick: (date: Date) => void;
  /** A quick pick: one day (start and end the same) or a range. */
  onPreset: (start: Date, end: Date) => void;
  /** "Any date": no dates at all. */
  onAnyDate: () => void;
  onClear: () => void;
  onApply: () => void;
  /** Mobile's Apply button can show the result count instead ("Show 12 experiences"). */
  mobileApplyLabel?: string;
  className?: string;
}

const DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}

/** Tonight, Tomorrow, This weekend, Next 7 days, Next weekend and Any date. */
export function rangePresets(): DatePickerPreset[] {
  const [today, tomorrow, thisWeekend] = computeDatePresets();
  return [
    { ...today, label: "Tonight" },
    tomorrow,
    { ...thisWeekend, endDate: addDays(thisWeekend.date, 1) },
    { label: "Next 7 days", date: today.date, endDate: addDays(today.date, 7) },
    { label: "Next weekend", date: addDays(thisWeekend.date, 7), endDate: addDays(thisWeekend.date, 8) },
    { label: "Any date", date: today.date },
  ];
}

function caption(start: Date | null, end: Date | null) {
  const long = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
  if (!start) return "Choose a date or a range";
  if (!end) return `${long.format(start)}, pick an end date`;
  return `${long.format(start)} to ${long.format(end)}`;
}

/**
 * The dual-date picker everywhere dates are searched: a caption, quick picks with Tonight first,
 * two months side by side (one on mobile), and Clear / Apply. Used by the search bar's When and
 * the results page's Dates chip.
 */
export function DateRangePanel({
  range,
  onPick,
  onPreset,
  onAnyDate,
  onClear,
  onApply,
  mobileApplyLabel,
  className,
}: DateRangePanelProps) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <p className="font-sans text-sm text-[#1f1c20]">{caption(range.start, range.end)}</p>
      <DatePickerCalendar
        selectedDate={null}
        range={range}
        presets={rangePresets()}
        minDate={new Date()}
        onSelect={onPick}
        onSelectPreset={(preset) => {
          if (preset.label === "Any date") onAnyDate();
          else onPreset(preset.date, preset.endDate ?? preset.date);
        }}
      />
      <div className="flex items-center justify-between border-t border-[#e7e7e7] pt-4">
        <button
          type="button"
          onClick={onClear}
          className="font-sans text-sm font-medium text-[#1f1c20] underline-offset-2 hover:underline cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          disabled={!range.start}
          onClick={onApply}
          className="h-11 rounded-full bg-brand px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <span className="max-md:hidden">Apply</span>
          <span className="md:hidden">{mobileApplyLabel ?? "Apply"}</span>
        </button>
      </div>
    </div>
  );
}
