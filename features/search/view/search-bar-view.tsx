"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { DateRangePanel } from "@/components/shared/date-range-panel";
import { cn } from "@/lib/utils";

import type { SearchBarVariant, SearchTab } from "../model/search.types";
import type { SearchBarViewModel } from "../view-model/use-search-bar-view-model";
import { SearchSuggestionList } from "./search-suggestion-item-view";
import { WhoGuestsDropdownView } from "./who-guests-dropdown-view";

const PREFERRED_DROPDOWN_HEIGHT: Record<SearchTab, number> = {
  where: 420,
  when: 520,
  who: 340,
};

function computeDropdownLayout(
  rect: DOMRect,
  viewportHeight: number,
  variant: SearchBarVariant,
  tab: SearchTab,
): { placement: "top" | "bottom"; maxHeight?: number } {
  // Unlaid-out test environments (e.g. jsdom with zero rects) keep the default downward layout.
  if (rect.width === 0 && rect.height === 0) {
    return { placement: "bottom", maxHeight: undefined };
  }
  const edgePadding = 16;
  const topClearance = variant === "hero" ? 108 : 16;
  const spaceBelow = Math.floor(viewportHeight - rect.bottom - edgePadding);
  const spaceAbove = Math.floor(rect.top - topClearance);

  if (spaceBelow < PREFERRED_DROPDOWN_HEIGHT[tab] && spaceAbove > spaceBelow) {
    return { placement: "top", maxHeight: Math.max(200, spaceAbove) };
  }
  return { placement: "bottom", maxHeight: Math.max(200, spaceBelow) };
}

export interface SearchBarViewProps extends SearchBarViewModel {
  className?: string;
}

export function SearchBarView({
  variant,
  activeTab,
  selectedWhere,
  selectedWhen,
  draftRange,
  whoText,
  guests,
  totalGuests,
  canSearch,
  isSearchingExperiences,
  suggestedExperiences,
  filteredDestinations,
  filteredActivities,
  filteredEvents,
  guestTypes,
  setActiveTab,
  setWhereInput,
  setWhoInput,
  onSelectDestination,
  onSelectActivity,
  onSelectExperience,
  onSelectEvent,
  onPickDate,
  onPickDatePreset,
  onApplyDates,
  onClearDates,
  onAnyDate,
  incrementGuest,
  decrementGuest,
  onSearch,
  onClose,
  className,
}: SearchBarViewProps) {
  const searchBarRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLInputElement>(null);
  const whenInputRef = useRef<HTMLInputElement>(null);
  const whoInputRef = useRef<HTMLInputElement>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{ placement: "top" | "bottom"; maxHeight?: number }>({
    placement: "bottom",
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (!activeTab) return;
    const tab = activeTab;
    function updateLayout() {
      const el = searchBarRef.current;
      if (!el) return;
      setDropdownLayout(computeDropdownLayout(el.getBoundingClientRect(), window.innerHeight, variant, tab));
    }
    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, { passive: true });
    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout);
    };
  }, [activeTab, variant]);

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "relative flex flex-col gap-2 rounded-[28px] border border-[#c7c1ba] bg-white p-2 text-left lg:flex-row lg:items-center lg:gap-[9px] lg:rounded-[57px] shadow-sm transition-all",
        variant === "nav" && "shadow-lg border-[#E0DFDD] bg-white",
        className,
      )}
    >
      <div className="flex flex-1 flex-col divide-y divide-[#e0dfdd] lg:flex-row lg:items-center lg:divide-y-0">
        {/* Where Tab */}
        <div
          onClick={() => {
            setActiveTab("where");
            whereInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "where" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60",
          )}
        >
          <label htmlFor={`search-where-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            Where
          </label>
          <input
            id={`search-where-${variant}`}
            ref={whereInputRef}
            type="text"
            value={selectedWhere}
            placeholder="Search destinations or activities"
            onFocus={() => setActiveTab("where")}
            onChange={(e) => setWhereInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            className="w-full border-0 bg-transparent p-0 font-sans text-base text-foreground placeholder:text-muted-foreground lg:text-sm outline-none focus:ring-0 leading-tight"
          />
        </div>

        {/* Divider (side-by-side layout only; the stacked phone layout uses divide-y above) */}
        <span aria-hidden="true" data-testid="search-field-divider" className="hidden h-[39px] w-px shrink-0 bg-[#E0DFDD] lg:block" />

        {/* When Tab */}
        <div
          onClick={() => {
            setActiveTab("when");
            whenInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "when" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60",
          )}
        >
          <label htmlFor={`search-when-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            When
          </label>
          <input
            id={`search-when-${variant}`}
            ref={whenInputRef}
            type="text"
            value={selectedWhen}
            placeholder="Add dates"
            readOnly
            onFocus={() => setActiveTab("when")}
            className="w-full border-0 bg-transparent p-0 font-sans text-base text-foreground placeholder:text-muted-foreground lg:text-sm outline-none focus:ring-0 leading-tight cursor-pointer"
          />
        </div>

        {/* Divider (side-by-side layout only; the stacked phone layout uses divide-y above) */}
        <span aria-hidden="true" data-testid="search-field-divider" className="hidden h-[39px] w-px shrink-0 bg-[#E0DFDD] lg:block" />

        {/* Who Tab */}
        <div
          onClick={() => {
            setActiveTab("who");
            whoInputRef.current?.focus();
          }}
          className={cn(
            "flex flex-1 flex-col items-start gap-1 rounded-[57px] px-5 py-2.5 text-left transition-colors cursor-pointer",
            activeTab === "who" ? "bg-[#F4F2EE]" : "bg-transparent hover:bg-[#F4F2EE]/60",
          )}
        >
          <label htmlFor={`search-who-${variant}`} className="text-xs font-semibold text-foreground cursor-pointer">
            Who
          </label>
          <input
            id={`search-who-${variant}`}
            ref={whoInputRef}
            type="text"
            value={whoText}
            placeholder="Add guests"
            onFocus={() => setActiveTab("who")}
            onChange={(e) => setWhoInput(e.target.value)}
            className="w-full border-0 bg-transparent p-0 font-sans text-base text-foreground placeholder:text-muted-foreground lg:text-sm outline-none focus:ring-0 leading-tight"
          />
        </div>
      </div>

      {/* Search Button */}
      {variant === "nav" ? (
        <button
          type="button"
          aria-label="Search"
          disabled={!canSearch}
          onClick={() => onSearch()}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 text-white transition-all hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm w-full lg:w-auto"
        >
          <Search className="size-4 stroke-[2.5]" />
          <span className="font-sans text-sm font-semibold">Search</span>
        </button>
      ) : (
        <button
          type="button"
          aria-label="Search"
          disabled={!canSearch}
          onClick={() => onSearch()}
          className="flex size-12 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto cursor-pointer"
        >
          <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
        </button>
      )}

      {/* Suggested Destinations & Activities Dropdown Modal */}
      {activeTab === "where" && (
        <div
          style={dropdownLayout.maxHeight ? { maxHeight: dropdownLayout.maxHeight } : undefined}
          className={cn(
            "absolute left-0 z-50 flex w-[440px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
            dropdownLayout.placement === "top" ? "bottom-[calc(100%+12px)]" : "top-[calc(100%+12px)]",
          )}
        >
          <div className="flex min-h-0 w-full flex-1 flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            <SearchSuggestionList
              destinations={filteredDestinations}
              activities={filteredActivities}
              experiences={suggestedExperiences}
              events={filteredEvents}
              isSearchingExperiences={isSearchingExperiences}
              query={selectedWhere}
              onSelectDestination={(dest) => {
                onSelectDestination(dest);
                setTimeout(() => whenInputRef.current?.focus(), 80);
              }}
              onSelectActivity={(act) => {
                onSelectActivity(act);
                setTimeout(() => whenInputRef.current?.focus(), 80);
              }}
              onSelectExperience={(exp) => {
                onSelectExperience(exp);
                setTimeout(() => whenInputRef.current?.focus(), 80);
              }}
              onSelectEvent={(ev) => {
                onSelectEvent(ev);
                setTimeout(() => whenInputRef.current?.focus(), 80);
              }}
            />
          </div>
        </div>
      )}

      {/* Dual-date picker: the same panel as the results page's Dates chip. */}
      {activeTab === "when" && (
        <div
          role="dialog"
          aria-label="Dates"
          style={dropdownLayout.maxHeight ? { maxHeight: dropdownLayout.maxHeight } : undefined}
          className={cn(
            "absolute left-1/2 z-50 w-[700px] max-w-[calc(100vw-32px)] -translate-x-1/2 overflow-y-auto rounded-[24px] border border-[#e0dfdd] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
            dropdownLayout.placement === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]",
          )}
        >
          <DateRangePanel
            range={draftRange}
            onPick={onPickDate}
            onPreset={onPickDatePreset}
            onAnyDate={() => {
              onAnyDate();
              setTimeout(() => whoInputRef.current?.focus(), 80);
            }}
            onClear={onClearDates}
            onApply={() => {
              onApplyDates();
              setTimeout(() => whoInputRef.current?.focus(), 80);
            }}
          />
        </div>
      )}

      {/* Who Guests Dropdown Modal */}
      {activeTab === "who" && (
        <WhoGuestsDropdownView
          variant={variant}
          guests={guests}
          totalGuests={totalGuests}
          canSearch={canSearch}
          guestTypes={guestTypes}
          incrementGuest={incrementGuest}
          decrementGuest={decrementGuest}
          onSearch={onSearch}
          placement={dropdownLayout.placement}
          maxHeight={dropdownLayout.maxHeight}
        />
      )}
    </div>
  );
}
