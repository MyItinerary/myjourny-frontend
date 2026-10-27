import { ChevronDown, ListFilter, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ExperienceReviewsViewModel } from "../view-model/use-experience-reviews-view-model";

const PILL = "flex h-12 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border bg-white font-sans text-sm font-medium leading-5";

type ToolbarProps = Pick<
  ExperienceReviewsViewModel,
  | "query"
  | "onQueryChange"
  | "onClearQuery"
  | "sortLabel"
  | "sortOptions"
  | "sort"
  | "sortOpen"
  | "onToggleSort"
  | "onSortChange"
  | "filterOpen"
  | "onToggleFilter"
  | "ratingFilter"
  | "onRatingFilter"
  | "activeFilterCount"
  | "onClearFilters"
>;

/** Search, sort and filter above the review list. */
export function ReviewsToolbarView(props: ToolbarProps) {
  const { query, sortOpen, filterOpen, activeFilterCount, ratingFilter } = props;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 md:flex-nowrap">
        <label
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-full border px-4 md:w-auto md:flex-1",
            query ? "border-2 border-[#333134]" : "border-[#E0DFDD]",
          )}
        >
          <Search aria-hidden className="size-[18px] shrink-0 text-[#333134]" />
          <input
            type="text"
            value={query}
            onChange={(event) => props.onQueryChange(event.target.value)}
            placeholder="Search reviews"
            aria-label="Search reviews"
            className="min-w-0 flex-1 bg-transparent text-[15px] leading-[22px] text-[#333134] outline-none placeholder:text-[#6F6B72]"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={props.onClearQuery} className="cursor-pointer">
              <X aria-hidden className="size-4" />
            </button>
          )}
        </label>

        <div className="relative flex-1 md:flex-none">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onClick={props.onToggleSort}
            className={cn(PILL, "w-full justify-center px-[18px] md:w-auto", sortOpen ? "border-2 border-[#333134]" : "border-[#E0DFDD]")}
          >
            {props.sortLabel}
            <ChevronDown aria-hidden className={cn("size-4 transition-transform", sortOpen && "rotate-180")} />
          </button>
          {sortOpen && (
            <ul
              role="listbox"
              aria-label="Sort reviews"
              className="absolute right-0 top-14 z-10 w-60 rounded-2xl border border-[#E7E7E7] bg-white p-2 shadow-lg"
            >
              {props.sortOptions.map((option) => (
                <li key={option.value} role="option" aria-selected={option.value === props.sort}>
                  <button
                    type="button"
                    onClick={() => props.onSortChange(option.value)}
                    className={cn(
                      "w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[15px] leading-[22px] text-[#333134] hover:bg-[#F4F2EE]",
                      option.value === props.sort && "bg-[#F4F2EE] font-medium",
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          aria-expanded={filterOpen}
          onClick={props.onToggleFilter}
          className={cn(
            PILL,
            "flex-1 justify-center px-[18px] md:flex-none",
            activeFilterCount > 0 ? "border-[#32070F] bg-[#32070F] text-white" : "border-[#E0DFDD] text-[#333134]",
            filterOpen && activeFilterCount === 0 && "border-2 border-[#333134]",
          )}
        >
          <ListFilter aria-hidden className="size-4" />
          {activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : "Filter"}
        </button>
      </div>

      {filterOpen && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[#E7E7E7] p-5">
          <p className="font-sans text-[15px] font-medium leading-[22px] text-[#333134]">Rating</p>
          <div className="flex flex-wrap gap-2">
            {[null, 5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars ?? "all"}
                type="button"
                aria-pressed={ratingFilter === stars}
                onClick={() => props.onRatingFilter(stars)}
                className={cn(
                  "h-9 cursor-pointer rounded-full border px-4 text-sm leading-5",
                  ratingFilter === stars
                    ? "border-[#32070F] bg-[#32070F] font-medium text-white"
                    : "border-[#E0DFDD] text-[#333134] hover:bg-[#F4F2EE]",
                )}
              >
                {stars == null ? "All" : `${stars} star${stars === 1 ? "" : "s"}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {ratingFilter != null && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => props.onRatingFilter(null)}
            aria-label={`Remove ${ratingFilter} star filter`}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#F4F2EE] px-3 text-sm leading-5 text-[#333134]"
          >
            {ratingFilter} star{ratingFilter === 1 ? "" : "s"}
            <X aria-hidden className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={props.onClearFilters}
            className="cursor-pointer text-sm leading-5 text-[#333134] underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
