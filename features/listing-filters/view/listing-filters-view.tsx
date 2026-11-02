import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ListingFiltersViewModel } from "../view-model/use-listing-filters-view-model";

type Props = Pick<ListingFiltersViewModel, "chips" | "activeCount" | "onToggle" | "onSelect" | "onClose" | "onClearAll">;

/** Filter chips. A chip's options open as a bottom sheet on phones and a
 * dropdown under the chip from `sm` up. */
export function ListingFiltersView({ chips, activeCount, onToggle, onSelect, onClose, onClearAll }: Props) {
  const open = chips.find((c) => c.open);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <div key={chip.id} className="relative">
          <button
            type="button"
            aria-expanded={chip.open}
            aria-haspopup="dialog"
            onClick={() => onToggle(chip.id)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm transition-colors cursor-pointer",
              chip.active ? "bg-[#130404] text-white" : "bg-[#F4F2EE] text-foreground hover:bg-[#eae7e1]",
            )}
          >
            {chip.label}
            <ChevronDown className={cn("size-4 transition-transform", chip.open && "rotate-180")} aria-hidden />
          </button>
          {chip.open && (
            <div
              role="dialog"
              aria-label={chip.name}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[24px] bg-white p-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.14)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-[calc(100%+8px)] sm:w-64 sm:rounded-2xl sm:border sm:border-[#e0dfdd] sm:p-2 sm:shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
            >
              <ul>
                {chip.options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      aria-pressed={option.selected}
                      onClick={() => onSelect(chip.id, option.id)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-base text-foreground hover:bg-[#F4F2EE] cursor-pointer sm:text-sm"
                    >
                      {option.label}
                      {option.selected && <Check className="size-4 text-brand" aria-hidden />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-brand cursor-pointer"
        >
          <X className="size-4" aria-hidden />
          Clear filters
        </button>
      )}
      {open && (
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-black/30 sm:bg-transparent"
        />
      )}
    </div>
  );
}
