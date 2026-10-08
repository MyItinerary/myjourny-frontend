"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { cn } from "@/lib/utils";

import type { SearchBarViewModel } from "../view-model/use-search-bar-view-model";
import { SearchSuggestionList } from "./search-suggestion-item-view";
import { WhoGuestsDropdownView } from "./who-guests-dropdown-view";

export interface SearchBarViewProps extends SearchBarViewModel {
  className?: string;
}

export function SearchBarView({
  variant,
  activeTab,
  selectedWhere,
  selectedWhen,
  selectedDate,
  whoText,
  guests,
  totalGuests,
  allFieldsFilled,
  isSearchingExperiences,
  suggestedExperiences,
  filteredDestinations,
  filteredActivities,
  guestTypes,
  setActiveTab,
  setWhereInput,
  setWhoInput,
  onSelectDestination,
  onSelectActivity,
  onSelectExperience,
  onSelectDate,
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

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "relative flex flex-col gap-2 rounded-[28px] border border-[#c7c1ba] bg-white p-2 lg:flex-row lg:items-center lg:gap-[9px] lg:rounded-[57px] shadow-sm transition-all",
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
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight"
          />
        </div>

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
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight cursor-pointer"
          />
        </div>

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
            className="w-full border-0 bg-transparent p-0 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0 leading-tight"
          />
        </div>
      </div>

      {/* Search Button */}
      {variant === "nav" ? (
        <button
          type="button"
          aria-label="Search"
          disabled={!allFieldsFilled}
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
          disabled={!allFieldsFilled}
          onClick={() => onSearch()}
          className="flex size-12 shrink-0 items-center justify-center self-end rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto cursor-pointer"
        >
          <Image src="/icons/search-lg.svg" alt="" width={20} height={20} className="invert" />
        </button>
      )}

      {/* Suggested Destinations & Activities Dropdown Modal */}
      {activeTab === "where" && (
        <div className="absolute top-[calc(100%+12px)] left-0 z-50 flex w-[440px] max-w-[calc(100vw-32px)] flex-col items-start gap-4 rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex w-full flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
            <SearchSuggestionList
              destinations={filteredDestinations}
              activities={filteredActivities}
              experiences={suggestedExperiences}
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
            />
          </div>
        </div>
      )}

      {/* Calendar Dropdown Modal */}
      {activeTab === "when" && (
        <div
          className={cn(
            "absolute z-50 flex w-[350px] max-w-[calc(100vw-32px)] flex-col items-start gap-3 rounded-[24px] border border-[#e0dfdd] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.14)] animate-in fade-in zoom-in-95 duration-150",
            variant === "nav" ? "top-[calc(100%+8px)] left-1/2 -translate-x-1/2" : "top-[calc(100%+8px)] left-0 lg:left-[170px]",
          )}
        >
          <DatePickerCalendar
            selectedDate={selectedDate}
            presets={computeDatePresets()}
            onSelect={(date) => {
              const preset = computeDatePresets().find(
                (p) => p.date.toDateString() === date.toDateString(),
              );
              onSelectDate(
                date,
                preset?.label ?? date.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
              );
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
          guestTypes={guestTypes}
          incrementGuest={incrementGuest}
          decrementGuest={decrementGuest}
          onSearch={onSearch}
        />
      )}
    </div>
  );
}
