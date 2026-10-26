"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { computeDatePresets } from "@/components/shared/date-picker-calendar";
import { MONTH_NAMES, WEEKDAY_LABELS } from "@/lib/dates";
import { cn } from "@/lib/utils";

import type { SessionChoice } from "../view-model/use-session-choice";

type Props = Pick<
  SessionChoice,
  "selectedDate" | "endDate" | "minDate" | "isDateSelectable" | "dayState" | "onSelectDate"
>;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const same = (a: Date | null, b: Date) => !!a && startOfDay(a).getTime() === startOfDay(b).getTime();

/** The booking card's month: espresso for the picked day, cream across a run of days, an amber dot where
 * spots are few, struck through when sold out, grey when nothing runs. */
export function BookingCalendarView({ selectedDate, endDate, minDate, isDateSelectable, dayState, onSelectDate }: Props) {
  const [view, setView] = useState(() => startOfDay(selectedDate ?? new Date()));
  const year = view.getFullYear();
  const month = view.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1)),
  ];
  const presets = computeDatePresets().filter((p) => isDateSelectable(p.date));
  const move = (by: number) => setView(new Date(year, month + by, 1));
  const min = startOfDay(minDate).getTime();

  return (
    <div role="group" aria-label="Pick a date" className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_#ccc]">
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2.5 px-4 pt-4 pb-2">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onSelectDate(p.date)}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3.5 text-xs",
                same(selectedDate, p.date) ? "bg-[#32070F] text-white" : "border-[0.5px] border-[#E0DFDD] bg-white text-[#130404] hover:bg-[#F4F2EE]",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1 px-3 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => move(-1)} className="flex size-8 cursor-pointer items-center justify-center rounded-2xl hover:bg-[#F4F2EE]">
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-base font-medium text-[#130404]">{MONTH_NAMES[month]} {year}</span>
          <button type="button" aria-label="Next month" onClick={() => move(1)} className="flex size-8 cursor-pointer items-center justify-center rounded-2xl hover:bg-[#F4F2EE]">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex border-b border-[#F5F5F5] py-1 text-center text-[13px] text-[#6F6B72]">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w} className="min-w-0 flex-1">{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 pt-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`gap-${i}`} className="h-10" />;
            const state = dayState(date);
            const selectable = isDateSelectable(date) && startOfDay(date).getTime() >= min;
            const start = same(selectedDate, date);
            const end = same(endDate, date);
            const inRange = !!selectedDate && !!endDate && date > selectedDate && date < endDate;
            return (
              <button
                key={date.getDate()}
                type="button"
                disabled={!selectable}
                aria-pressed={start || end}
                aria-label={`${date.getDate()} ${MONTH_NAMES[month]}${state === "soldout" ? ", sold out" : state === "few" ? ", few spots left" : ""}`}
                onClick={() => onSelectDate(date)}
                className={cn(
                  "flex min-h-10 flex-col items-center justify-center gap-px text-sm",
                  start || end ? "rounded-lg bg-[#32070F] font-medium text-white" : inRange ? "bg-[#F4F2EE] text-[#333134]" : "rounded-lg",
                  !(start || end) && !inRange && (selectable ? "cursor-pointer text-[#333134] hover:bg-[#F4F2EE]" : "cursor-not-allowed text-[#BDBDBD]"),
                  state === "soldout" && !(start || end) && "text-[#BDBDBD] line-through",
                  state === "off" && !(start || end) && "text-[#BDBDBD]",
                )}
              >
                {date.getDate()}
                {state === "few" && <span aria-hidden className="size-[5px] rounded-full bg-[#FFB020]" />}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 px-1 pt-2 text-xs text-[#6F6B72]">
          <span className="flex items-center gap-1.5"><span aria-hidden className="size-[5px] rounded-full bg-[#FFB020]" />Few spots left</span>
          <span className="flex items-center gap-1.5"><s className="text-[#BDBDBD]">12</s>Sold out</span>
          <span className="flex items-center gap-1.5"><span className="text-[#BDBDBD]">12</span>No times</span>
        </div>
      </div>
    </div>
  );
}
