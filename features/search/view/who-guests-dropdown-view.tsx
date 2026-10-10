"use client";

import { cn } from "@/lib/utils";

import type { GuestCounts, SearchBarVariant } from "../model/search.types";
import type { GUEST_TYPES } from "../view-model/use-search-bar-view-model";

export interface WhoGuestsDropdownViewProps {
  variant?: SearchBarVariant;
  guests: GuestCounts;
  totalGuests: number;
  allFieldsFilled?: boolean;
  guestTypes: typeof GUEST_TYPES;
  incrementGuest: (key: keyof GuestCounts) => void;
  decrementGuest: (key: keyof GuestCounts) => void;
  onSearch: () => void;
  className?: string;
}

export function WhoGuestsDropdownView({
  variant = "hero",
  guests,
  totalGuests,
  allFieldsFilled = false,
  guestTypes,
  incrementGuest,
  decrementGuest,
  onSearch,
  className,
}: WhoGuestsDropdownViewProps) {
  return (
    <div
      className={cn(
        "absolute top-[calc(100%+12px)] right-0 z-50 flex w-[400px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
        variant === "hero" && "lg:right-4",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-6">
        {guestTypes.map((type) => (
          <div key={type.key} className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start self-stretch">
              <span className="font-sans text-[18px] font-medium leading-[27px] text-[#130404]">
                {type.label}
              </span>
              <span className="font-sans text-[14px] font-normal leading-[22px] text-[#6F6B72]">
                {type.description}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={guests[type.key] <= 0}
                onClick={() => decrementGuest(type.key)}
                className="flex size-9 items-center justify-center rounded-full border border-[#e0dfdd] text-lg font-light text-[#130404] transition-colors hover:border-[#130404] disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
              >
                -
              </button>
              <span className="w-4 text-center font-sans text-base font-medium text-[#130404]">
                {guests[type.key]}
              </span>
              <button
                type="button"
                onClick={() => incrementGuest(type.key)}
                className="flex size-9 items-center justify-center rounded-full border border-[#e0dfdd] text-lg font-light text-[#130404] transition-colors hover:border-[#130404] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        ))}
        {allFieldsFilled && (
          <div className="flex w-full justify-end border-t border-[#f0eee9] pt-3">
            <button
              type="button"
              onClick={() => onSearch()}
              className="rounded-full bg-brand px-5 py-2 font-sans text-xs font-semibold text-white transition-colors hover:bg-brand/90 cursor-pointer shadow-sm"
            >
              Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
