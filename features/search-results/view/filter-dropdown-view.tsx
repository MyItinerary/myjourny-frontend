"use client";

import { DateRangePanel } from "@/components/shared/date-range-panel";
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
          "w-[700px] max-w-[calc(100vw-32px)]",
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:w-full max-md:max-w-none max-md:rounded-b-none",
          className,
        )}
      >
        <DateRangePanel
          range={draftRange}
          onPick={pickDate}
          onPreset={pickDatePreset}
          onAnyDate={() => {
            clearDates();
            closeDropdown();
          }}
          onClear={clearDates}
          onApply={applyDates}
          mobileApplyLabel={total !== undefined ? `Show ${total} experiences` : undefined}
        />
      </div>
    </>
  );
}
