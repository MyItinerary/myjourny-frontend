"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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

// On phones the date picker is a bottom sheet with the More filters motion: up in 250ms, down in 200ms.
const SHEET_IN = { duration: 0.25, ease: [0.2, 0, 0, 1] as const };
const SHEET_OUT = { duration: 0.2, ease: [0.4, 0, 1, 1] as const };
const FADE = { duration: 0.15 };

export function FilterDropdownView(props: DropdownProps) {
  const { openDropdown, dropdownGroups, toggleOption, className } = props;

  if (openDropdown && openDropdown !== "dates") {
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

  // Kept mounted while it closes, so the phone sheet can roll back down.
  return <AnimatePresence>{openDropdown === "dates" && <DatesSheet key="dates" {...props} />}</AnimatePresence>;
}

function DatesSheet({ draftRange, total, pickDate, pickDatePreset, applyDates, clearDates, closeDropdown, className }: DropdownProps) {
  const reduce = useReducedMotion();
  // From md up it's an anchored dropdown, which opens and closes as it always has.
  const [wide] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches);

  const panel = (
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
  );

  if (wide) {
    return (
      <div role="dialog" aria-label="Dates" className={cn(PANEL, "w-[700px] max-w-[calc(100vw-32px)] max-h-[calc(100dvh-176px)] overflow-y-auto", className)}>
        {panel}
      </div>
    );
  }

  // On phones it's a bottom sheet behaving like More filters: on the page itself, above the
  // navbar and its blur (which would otherwise pin a fixed sheet to the filter row), under the same backdrop.
  return createPortal(
    <div data-filter-sheet className="fixed inset-0 z-[60] flex items-end">
      <motion.div
        aria-hidden
        onClick={closeDropdown}
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: reduce ? FADE : SHEET_IN }}
        exit={{ opacity: 0, transition: reduce ? FADE : SHEET_OUT }}
      />
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={{ opacity: 1, y: 0, transition: reduce ? FADE : SHEET_IN }}
        exit={reduce ? { opacity: 0, transition: FADE } : { y: "100%", transition: SHEET_OUT }}
        role="dialog"
        aria-modal="true"
        aria-label="Dates"
        className={cn(PANEL, "relative max-h-full w-full overflow-y-auto rounded-b-none shadow-[0_12px_48px_rgba(0,0,0,0.2)]")}
      >
        {panel}
      </motion.div>
    </div>,
    document.body,
  );
}
