"use client";

import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { FilterGroup } from "../model/filter-group.types";

export const MENU = "rounded-[14px] bg-white p-1.5 shadow-[inset_0_0_0_1px_#E7E7E7,0_12px_32px_rgba(16,24,40,0.14)] outline-none";

// A filter button on a table's toolbar, opening a menu of values. Categories
// can open out into their subcategories.
export function FilterDropdown({ group, onPick }: { group: FilterGroup; onPick: (key: string, value: string, sub?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const width = group.key === "category" ? "w-[238px]" : group.key === "listing" ? "w-[220px]" : group.key === "status" ? "w-[190px]" : "w-[180px]";
  const pick = (value: string, sub?: string) => {
    onPick(group.key, value, sub);
    setOpen(false);
    setExpanded(null);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`${group.label}: ${group.current}`}
        className={cn(
          "flex h-9 cursor-pointer items-center gap-[7px] rounded-full bg-white px-3 text-[12.5px] whitespace-nowrap text-[#333134] hover:bg-[#FAF9F7]",
          group.active || open ? "shadow-[inset_0_0_0_1.5px_#2C0101]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
        )}
      >
        <span className="text-[#6F6B72]">{group.label}</span>
        <span className="font-medium">{group.current.length > 22 ? `${group.current.slice(0, 20)}…` : group.current}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 text-[#6F6B72] transition-transform", open && "rotate-180")} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={6} className="z-40">
          <Popover.Popup className={cn(MENU, width, "flex max-h-[420px] flex-col overflow-y-auto")}>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => pick(group.anyValue)}
                className={cn(
                  "flex min-h-[34px] flex-1 cursor-pointer items-center gap-[9px] rounded-[9px] px-[9px] py-1.5 text-left text-[13px] text-[#333134] hover:bg-[#F5F5F5]",
                  !group.active ? "font-medium" : "font-normal",
                )}
              >
                <Check aria-hidden className={cn("size-[13px] shrink-0", group.active ? "text-transparent" : "text-[#F5032D]")} strokeWidth={2.6} />
                <span>{group.anyLabel}</span>
              </button>
            </div>
            {group.options.map((option) => {
              const isOpen = expanded === option.value;
              const chosen = option.selected || option.subs.some((s) => s.selected);
              return (
                <div key={option.value}>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => pick(option.value)}
                      className={cn(
                        "flex min-h-[34px] min-w-0 flex-1 cursor-pointer items-center gap-[9px] rounded-[9px] px-[9px] py-1.5 text-left text-[13px] text-[#333134] hover:bg-[#F5F5F5]",
                        option.selected ? "font-medium" : "font-normal",
                      )}
                    >
                      <Check aria-hidden className={cn("size-[13px] shrink-0", chosen ? "text-[#F5032D]" : "text-transparent")} strokeWidth={2.6} />
                      <span className="min-w-0 flex-1">{option.label}</span>
                    </button>
                    {option.subs.length > 0 && (
                      <button
                        type="button"
                        aria-label={`${isOpen ? "Hide" : "Show"} ${option.label} subcategories`}
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : option.value)}
                        className="flex size-[26px] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#6F6B72] hover:bg-[#F0F0F0]"
                      >
                        <ChevronDown aria-hidden className={cn("size-[13px] transition-transform", isOpen && "rotate-180")} />
                      </button>
                    )}
                  </div>
                  {isOpen && option.subs.length > 0 && (
                    <div className="mt-0.5 mb-1 ml-4 flex flex-col border-l border-[#EBEBEB] py-0.5 pl-3">
                      {option.subs.map((sub) => (
                        <button
                          key={sub.value}
                          type="button"
                          onClick={() => pick(option.value, sub.value)}
                          className={cn(
                            "flex min-h-[30px] cursor-pointer items-center gap-2 rounded-lg px-2 py-[5px] text-left text-[12.5px] hover:bg-[#F5F5F5]",
                            sub.selected ? "font-medium text-[#333134]" : "font-normal text-[#6F6B72]",
                          )}
                        >
                          <Check aria-hidden className={cn("size-3 shrink-0", sub.selected ? "text-[#F5032D]" : "text-transparent")} strokeWidth={2.8} />
                          <span>{sub.value}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
