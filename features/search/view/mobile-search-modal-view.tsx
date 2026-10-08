"use client";

import Image from "next/image";
import { X } from "lucide-react";

import type { SearchBarViewModel } from "../view-model/use-search-bar-view-model";
import { SearchSuggestionList } from "./search-suggestion-item-view";

export interface MobileSearchModalViewProps extends SearchBarViewModel {
  className?: string;
}

export function MobileSearchModalView({
  selectedWhere,
  isSearchingExperiences,
  suggestedExperiences,
  filteredDestinations,
  filteredActivities,
  setWhereInput,
  onNavigateToDestination,
  onNavigateToActivity,
  onNavigateToExperience,
  onSearch,
  onClose,
}: MobileSearchModalViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white p-6 lg:hidden animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#130404]">Search</h2>
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="flex size-9 items-center justify-center rounded-full bg-[#F4F2EE] text-[#130404] cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[#c7c1ba] bg-white px-4 py-3 shadow-xs">
        <Image src="/icons/search-lg.svg" alt="" width={18} height={18} />
        <input
          autoFocus
          type="text"
          value={selectedWhere}
          onChange={(e) => setWhereInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
          placeholder="Search destinations or activities"
          className="w-full border-0 bg-transparent font-sans text-base text-[#130404] placeholder:text-muted-foreground outline-none"
        />
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        <SearchSuggestionList
          destinations={filteredDestinations}
          activities={filteredActivities}
          experiences={suggestedExperiences}
          isSearchingExperiences={isSearchingExperiences}
          query={selectedWhere}
          onSelectDestination={onNavigateToDestination}
          onSelectActivity={onNavigateToActivity}
          onSelectExperience={onNavigateToExperience}
        />
      </div>
    </div>
  );
}
