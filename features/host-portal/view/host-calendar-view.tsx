import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CalendarCellModel, HostCalendarViewModel } from "../view-model/use-host-calendar-view-model";
import { CalendarDayPanelView } from "./host-calendar-day-panel-view";

const CARD = "overflow-hidden rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";
const NAV_BUTTON =
  "flex size-8 cursor-pointer items-center justify-center rounded-full bg-white text-[#6F6B72] shadow-[inset_0_0_0_1px_#E7E7E7]";

const LEGEND = [
  ["Booked", "bg-[#F5032D]"],
  ["Sold out", "bg-[#3086FF]"],
  ["Blocked", "bg-[#E0E0E0]"],
] as const;

function Cell({ cell, vm }: { cell: CalendarCellModel; vm: HostCalendarViewModel }) {
  if (!cell.date) {
    return <div aria-hidden className="h-[102px] shadow-[inset_-1px_-1px_0_#F0F0F0]" />;
  }
  const date = cell.date;
  return (
    <button
      type="button"
      aria-label={cell.label}
      onMouseDown={() => vm.onCellDown(date)}
      onMouseEnter={() => vm.onCellEnter(date)}
      onMouseUp={() => vm.onCellUp(date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          vm.onCellKey(date);
        }
      }}
      className={cn(
        "flex h-[102px] cursor-pointer flex-col items-stretch gap-[5px] px-2.5 py-[9px] text-left shadow-[inset_-1px_-1px_0_#F0F0F0] select-none focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_1.5px_#F5032D]",
        cell.dragging
          ? "bg-[#FDF7EB]"
          : cell.blocked
            ? "bg-[repeating-linear-gradient(135deg,#F5F5F5,#F5F5F5_5px,#EEEEEE_5px,#EEEEEE_10px)]"
            : cell.tone === "sold-out"
              ? "bg-[#F6FAFF]"
              : cell.tone === "booked"
                ? "bg-[#FFFCFC]"
                : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "text-[12.5px]",
          cell.today ? "font-semibold text-[#F5032D]" : cell.past ? "font-normal text-[#BDBDBD]" : "font-normal text-[#333134]",
        )}
      >
        {cell.day}
      </span>
      {cell.events.map((event) => (
        <span key={event.id} className="flex min-w-0 flex-col gap-[5px]">
          <span
            className={cn(
              "truncate rounded-md px-[7px] py-[3px] text-[11.5px] font-medium text-white",
              event.kind === "sold-out" ? "bg-[#3086FF]" : "bg-[#F5032D]",
            )}
          >
            {event.title}
          </span>
          {event.note && <span className="truncate text-[11px] text-[#6F6B72]">{event.note}</span>}
        </span>
      ))}
    </button>
  );
}

function ListView({ vm }: { vm: HostCalendarViewModel }) {
  if (vm.listRows.length === 0) {
    return <p className="px-6 py-14 text-center text-[13.5px] text-[#6F6B72]">Nothing booked or blocked in this stretch.</p>;
  }
  return (
    <ul>
      {vm.listRows.map((row) => (
        <li key={row.date} className="shadow-[inset_0_-1px_0_#F0F0F0] last:shadow-none">
          <button
            type="button"
            onClick={() => vm.onOpenDay(row.date)}
            className="flex w-full cursor-pointer items-center gap-4 px-[18px] py-3.5 text-left hover:bg-[#FCFCFC]"
          >
            <span className="w-[110px] shrink-0 text-[13.5px] font-medium text-[#333134]">{row.title}</span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              {row.events.map((event) => (
                <span key={event.id} className="flex items-center gap-2 text-[13px] text-[#333134]">
                  <span className={cn("size-2 shrink-0 rounded-full", event.kind === "sold-out" ? "bg-[#3086FF]" : "bg-[#F5032D]")} />
                  <span className="truncate">{event.title}</span>
                  {event.note && <span className="truncate text-[12px] text-[#6F6B72]">{event.note}</span>}
                </span>
              ))}
              {row.blocked && <span className="text-[13px] text-[#6F6B72]">Blocked</span>}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

// Handoff "Listing Builder" prototype, Calendar: month, week and list views of
// what's booked, sold out and blocked. Click a date for the day, or press and
// drag across dates to block a stretch.
export function HostCalendarView({ vm }: { vm: HostCalendarViewModel }) {
  if (!vm.ready) return <div className="flex-1 bg-[#FCFCFC]" />;

  return (
    <div className="flex min-h-0 flex-1 bg-[#FCFCFC]">
      <div className="min-w-0 flex-1 overflow-y-auto px-[26px] pt-[18px] pb-[90px]">
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div role="tablist" aria-label="Calendar view" className="flex items-center gap-0.5 rounded-full bg-white p-[3px] shadow-[inset_0_0_0_1px_#E7E7E7]">
            {vm.views.map((v) => (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={vm.view === v.key}
                onClick={() => vm.onView(v.key)}
                className={cn(
                  "h-[30px] cursor-pointer rounded-full px-3.5 text-[12.5px] font-medium text-[#333134]",
                  vm.view === v.key ? "bg-[#F4F2EE]" : "bg-transparent",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="ml-2 flex items-center gap-1">
            <button type="button" aria-label={vm.view === "week" ? "Previous week" : "Previous month"} onClick={vm.onPrev} className={NAV_BUTTON}>
              <ChevronLeft aria-hidden className="size-[15px]" strokeWidth={1.9} />
            </button>
            <span className="px-1.5 text-sm font-medium text-[#333134]">{vm.title}</span>
            <button type="button" aria-label={vm.view === "week" ? "Next week" : "Next month"} onClick={vm.onNext} className={NAV_BUTTON}>
              <ChevronRight aria-hidden className="size-[15px]" strokeWidth={1.9} />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-3.5 text-xs text-[#6F6B72]">
            {LEGEND.map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("block size-[9px] rounded-[3px]", color)} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className={CARD}>
          {vm.view === "list" ? (
            <ListView vm={vm} />
          ) : (
            <>
              <div className="grid grid-cols-7 shadow-[inset_0_-1px_0_#E7E7E7]">
                {vm.weekdays.map((d) => (
                  <div key={d} className="px-3 py-2.5 text-[11.5px] font-medium text-[#6F6B72]">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7" onMouseUp={vm.onEndDrag} onMouseLeave={vm.onEndDrag}>
                {vm.cells.map((cell, i) => (
                  <Cell key={cell.date ?? `blank-${i}`} cell={cell} vm={vm} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-[18px] gap-y-1 text-xs text-[#A09DA3]">
          <span>Click a date to see the day. Press and drag across dates to block a stretch of them.</span>
          <span className="ml-auto whitespace-nowrap">{vm.totals}</span>
        </div>
      </div>

      <CalendarDayPanelView panel={vm.panel} onClose={vm.onClosePanel} onToggleBlock={vm.onToggleBlock} />
    </div>
  );
}
