"use client";

import { computeDatePresets, DatePickerCalendar, type DatePickerPreset } from "@/components/shared/date-picker-calendar";
import { cn } from "@/lib/utils";

import type { SearchResultsViewModel } from "../view-model/use-search-results-view-model";
import { OptionChip } from "./filter-controls-view";

type DropdownProps = Pick<
  SearchResultsViewModel,
  | "openDropdown"
  | "draftRange"
  | "total"
  | "pickDate"
  | "pickDatePreset"
  | "applyDates"
  | "clearDates"
  | "closeDropdown"
  | "dropdownGroups"
  | "toggleOption"
> & { className?: string };

const DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY);
}

/** Tonight, Tomorrow, This weekend, Next 7 days, Next weekend and Any date. */
function rangePresets(): DatePickerPreset[] {
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

function dateCaption(start: Date | null, end: Date | null) {
  const long = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
  if (!start) return "Choose a date or a range";
  if (!end) return `${long.format(start)}, pick an end date`;
  return `${long.format(start)} to ${long.format(end)}`;
}

const PANEL =
  "z-40 flex flex-col gap-5 rounded-[24px] border border-[#e0dfdd] bg-white p-5 shadow-[0_12px_48px_rgba(0,0,0,0.2)]";

export function FilterDropdownView({
  openDropdown,
  draftRange,
  total,
  pickDate,
  pickDatePreset,
  applyDates,
  clearDates,
  closeDropdown,
  dropdownGroups,
  toggleOption,
  className,
}: DropdownProps) {
  if (!openDropdown) return null;

  if (openDropdown !== "dates") {
    const group = dropdownGroups[openDropdown];
    return (
      <div
        role="dialog"
        aria-label={openDropdown === "age" ? "Age limit" : group.label}
        className={cn(PANEL, "w-[340px] max-w-[calc(100vw-32px)]", className)}
      >
        <div className="flex flex-wrap gap-2">
          {group.options.map((o) => (
            <OptionChip
              key={o.value}
              selected={o.selected}
              disabled={o.disabled}
              onClick={() => toggleOption(group.id, o.value)}
            >
              {o.label}
            </OptionChip>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div aria-hidden onClick={closeDropdown} className="fixed inset-0 z-30 bg-black/40 md:hidden" />
      <div
        role="dialog"
        aria-label="Dates"
        className={cn(
          PANEL,
          "w-[700px] max-w-[calc(100vw-32px)] gap-4",
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:w-full max-md:max-w-none max-md:rounded-b-none",
          className,
        )}
      >
        <p className="font-sans text-sm text-[#1f1c20]">{dateCaption(draftRange.start, draftRange.end)}</p>
        <DatePickerCalendar
          selectedDate={null}
          range={draftRange}
          presets={rangePresets()}
          minDate={new Date()}
          onSelect={pickDate}
          onSelectPreset={(preset) => {
            if (preset.label === "Any date") {
              clearDates();
              closeDropdown();
            } else if (preset.endDate) {
              pickDatePreset(preset.date, preset.endDate);
            } else {
              pickDatePreset(preset.date, preset.date);
            }
          }}
        />
        <div className="flex items-center justify-between border-t border-[#e7e7e7] pt-4">
          <button
            type="button"
            onClick={clearDates}
            className="font-sans text-sm font-medium text-[#1f1c20] underline-offset-2 hover:underline cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={!draftRange.start}
            onClick={applyDates}
            className="h-11 rounded-full bg-brand px-6 font-sans text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            <span className="max-md:hidden">Apply</span>
            <span className="md:hidden">{total !== undefined ? `Show ${total} experiences` : "Apply"}</span>
          </button>
        </div>
      </div>
    </>
  );
}
