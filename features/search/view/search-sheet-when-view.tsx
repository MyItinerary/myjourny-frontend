"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import type { CalendarDay } from "../model/search-sheet.types";
import type { SearchSheetViewModel } from "../view-model/use-search-sheet-view-model";
import { CARD_TITLE, NO_SCROLLBAR, OPEN_CARD } from "./search-sheet-where-view";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** The open When card (Figma 2C): quick picks, then months that scroll vertically. */
export function WhenCardView(vm: SearchSheetViewModel) {
  return (
    <div className={cn(OPEN_CARD, "min-h-0 flex-1")}>
      <div className="h-[46px] shrink-0 pb-[14px]">
        <h2 className={CARD_TITLE}>When?</h2>
      </div>
      <div className={cn("-mx-5 flex shrink-0 gap-2 overflow-x-auto px-5", NO_SCROLLBAR)}>
        {vm.datePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            aria-pressed={preset.selected}
            onClick={() => vm.onPickPreset(preset)}
            className={cn(
              "flex h-10 shrink-0 cursor-pointer items-center rounded-full px-3.5 text-sm font-medium whitespace-nowrap",
              preset.selected ? "bg-[#333134] text-white" : "bg-white text-[#333134] ring-1 ring-[#E0DFDD] ring-inset",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="shrink-0 pt-4">
        <div className="grid grid-cols-7 border-b border-[#E7E7E7] pb-2" aria-hidden>
          {WEEKDAYS.map((day, i) => (
            <span key={i} className="text-center text-xs font-medium text-[#6F6B72]">
              {day}
            </span>
          ))}
        </div>
      </div>
      <div className="relative -mx-5 flex min-h-0 flex-1 flex-col">
        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-6", NO_SCROLLBAR)}>
          {vm.months.map((month, index) => (
            <div key={month.key}>
              <p className={cn("pb-1.5 text-[15px] font-medium text-[#333134]", index === 0 ? "pt-3" : "pt-[14px]")}>{month.label}</p>
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: month.leadingBlanks }, (_, i) => (
                  <span key={`blank-${i}`} className="h-[42px]" />
                ))}
                {month.days.map((day) => (
                  <DayCell key={day.day} day={day} onPick={vm.onPickDay} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-white/0 to-white" />
      </div>
      <div className="-mx-5 flex min-h-[52px] shrink-0 items-center justify-between border-t border-[#E7E7E7] px-5">
        <p className="text-[13px] text-[#6F6B72]">Times are in Lagos time (WAT).</p>
        <button type="button" onClick={vm.onSkipDates} className="flex min-h-11 min-w-11 cursor-pointer items-center justify-end text-[15px] font-medium text-[#333134] underline">
          Skip
        </button>
      </div>
    </div>
  );
}

const DAY_LABEL = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Ends of the range are ink circles with the light band between them; past days are greyed, today is ringed. */
function DayCell({ day, onPick }: { day: CalendarDay; onPick: (date: Date) => void }) {
  const past = day.state === "past";
  return (
    <div className="relative flex h-[42px] items-center justify-center">
      {day.band !== "none" && (
        <span
          aria-hidden
          className={cn(
            "absolute top-px h-10 bg-[#ECEAE6]",
            day.band === "start" && "right-0 left-1/2",
            day.band === "end" && "right-1/2 left-0",
            day.band === "middle" && "inset-x-0",
          )}
        />
      )}
      <button
        type="button"
        disabled={past}
        aria-pressed={day.selected}
        aria-label={DAY_LABEL.format(day.date)}
        onClick={() => onPick(day.date)}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-full text-sm",
          past ? "cursor-default text-[#C4C1C6]" : "cursor-pointer text-[#333134]",
          day.selected && "bg-[#333134] font-semibold text-white",
          day.state === "today" && !day.selected && "ring-1 ring-[#333134] ring-inset",
        )}
      >
        {day.day}
      </button>
    </div>
  );
}

/** The open Who card (Figma 2D): adults, children and infants, each with the Figma stepper. */
export function WhoCardView(vm: SearchSheetViewModel) {
  return (
    <div className="flex flex-col px-5 pt-[22px] pb-5">
      <div className="pb-[18px]">
        <h2 className={cn("h-8", CARD_TITLE)}>Who&apos;s coming?</h2>
      </div>
      {vm.guestTypes.map((type) => (
        <div key={type.key} className="flex min-h-14 items-center justify-between">
          <div className="flex flex-col">
            <p className="text-base font-medium text-[#333134]">{type.label}</p>
            <p className="text-[13px] text-[#6F6B72]">{type.description}</p>
          </div>
          <div className="flex items-center gap-[14px]">
            <StepperButton label={`Remove ${type.label.toLowerCase()}`} icon="minus" enabled={type.canRemove} onClick={() => vm.onRemoveGuest(type.key)} />
            <span aria-live="polite" className="min-w-5 text-center text-[17px] font-medium text-[#333134]">
              {type.count}
            </span>
            <StepperButton label={`Add ${type.label.toLowerCase()}`} icon="plus" enabled={type.canAdd} onClick={() => vm.onAddGuest(type.key)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A quiet 32px grey circle with a dark icon; greys out further when it can't go on (none left to remove, or 20 in all). */
function StepperButton({ label, icon, enabled, onClick }: { label: string; icon: "minus" | "plus"; enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!enabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-full",
        enabled ? "cursor-pointer bg-[#F4F2EE] active:bg-[#E9E6E1]" : "cursor-default bg-[#E0DFDD]",
      )}
    >
      <Image src={`/icons/search/${icon}${enabled ? "-dark" : ""}.svg`} alt="" width={16} height={16} unoptimized />
    </button>
  );
}
