import { Calendar, ChevronDown, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { BookingCalendarView } from "@/features/booking";
import { cn } from "@/lib/utils";

import type { DateFieldModel } from "../view-model/use-host-listing-builder-view-model";

// A date field that opens the app's calendar (the one guests book with) in a
// dropdown, and closes it once a day is picked or the host clicks away.
export function DateField({ label, field }: { label: string; field: DateFieldModel }) {
  const ref = useRef<HTMLDivElement>(null);
  const { open, onOpenChange } = field;

  useEffect(() => {
    if (!open) return;
    const onOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`${label}: ${field.value ?? "not picked"}`}
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center gap-2.5 rounded-xl bg-white px-3.5 text-left text-[15px]",
          open ? "shadow-[inset_0_0_0_1.5px_#F5032D]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
          field.onClear && "pr-11",
        )}
      >
        <Calendar aria-hidden className="size-[18px] shrink-0 text-[#6F6B72]" />
        <span className={cn("min-w-0 flex-1 truncate", field.value ? "text-[#333134]" : "text-[#A09DA3]")}>{field.value ?? "Pick a date"}</span>
        {!field.onClear && <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-[#6F6B72] transition-transform", open && "rotate-180")} />}
      </button>
      {field.onClear && (
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={field.onClear}
          className="absolute top-3 right-3 flex size-6 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#F4F2EE]"
        >
          <X className="size-4" />
        </button>
      )}
      {open && (
        <div className="absolute top-[56px] left-0 z-40 w-[340px] max-w-[calc(100vw-40px)]">
          <BookingCalendarView
            selectedDate={field.selected}
            endDate={null}
            minDate={field.min}
            isDateSelectable={() => true}
            dayState={() => "open"}
            onSelectDate={field.onPick}
            legend={false}
          />
        </div>
      )}
    </div>
  );
}
