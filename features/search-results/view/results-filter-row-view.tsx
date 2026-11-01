"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DropdownFilterId, RowChip } from "../model/search-results.types";
import type { SearchResultsViewModel } from "../view-model/use-search-results-view-model";
import { FilterDropdownView } from "./filter-dropdown-view";

export type ResultsFilterRowViewProps = SearchResultsViewModel & { className?: string };

const CHIP =
  "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-sans text-[15px] font-medium whitespace-nowrap transition-all duration-200 ease-out cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f1c20] focus-visible:ring-offset-2 active:scale-[0.97]";
const CHIP_LIGHT = "bg-[#f1eeea] text-[#1f1c20] hover:bg-[#e6e2dc]";
const CHIP_DARK = "bg-[#1f1c20] text-white hover:bg-[#383438]";

// Panel widths, so a dropdown opened near the right edge stays inside the row.
const PANEL_WIDTH: Record<DropdownFilterId, number> = { dates: 700, duration: 340, languages: 340, age: 340 };

function fadeMask(left: boolean, right: boolean) {
  if (!left && !right) return undefined;
  return `linear-gradient(to right, ${left ? "transparent 0, black 80px" : "black 0"}, ${
    right ? "black calc(100% - 120px), transparent 100%" : "black 100%"
  })`;
}

function RemoveX({ label, onRemove }: { label: string; onRemove: (e: MouseEvent) => void }) {
  return (
    <span
      role="button"
      aria-label={`Remove ${label}`}
      onClick={onRemove}
      className="-mr-1 flex size-5 items-center justify-center rounded-full"
    >
      <X className="size-4" />
    </span>
  );
}

export function ResultsFilterRowView(props: ResultsFilterRowViewProps) {
  const {
    rowChips,
    subRows,
    filterCount,
    openDropdown,
    toggleCategory,
    toggleSubcategory,
    selectAllSubcategories,
    toggleDropdown,
    closeDropdown,
    clearChip,
    openPanel,
    className,
  } = props;
  const bandRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [anchorLeft, setAnchorLeft] = useState(0);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows, rowChips.length]);

  // The row sticks under the header and gains a shadow once results scroll.
  useEffect(() => {
    function onScroll() {
      const band = bandRef.current;
      if (!band) return;
      // Compare with where the row actually sticks (its computed `top`), with a pixel and a half of slack:
      // on real devices it can settle a fraction past the exact offset and would otherwise never count as stuck.
      const cssTop = parseFloat(getComputedStyle(band).top);
      const offset = Number.isNaN(cssTop) ? (window.innerWidth >= 1024 ? 100 : 96) : cssTop;
      setStuck(band.getBoundingClientRect().top <= offset + 1.5);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clicks outside the row close an open dropdown.
  useEffect(() => {
    if (!openDropdown) return;
    function onDown(e: globalThis.MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeDropdown();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDropdown();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDropdown, closeDropdown]);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  function scrollToStart() {
    scrollerRef.current?.scrollTo?.({ left: 0, behavior: "smooth" });
  }

  function onChip(chip: RowChip, e: MouseEvent<HTMLButtonElement>) {
    if (chip.kind === "category") {
      toggleCategory(chip.slug);
      scrollToStart();
      return;
    }
    if (chip.kind === "subcategory") {
      toggleSubcategory(chip.slug);
      scrollToStart();
      return;
    }
    if (chip.kind === "active") {
      openPanel();
      return;
    }
    if (chip.kind !== "dropdown") return;
    const container = containerRef.current?.getBoundingClientRect();
    const target = e.currentTarget.getBoundingClientRect();
    if (container) {
      const width = PANEL_WIDTH[chip.id];
      setAnchorLeft(Math.max(0, Math.min(target.left - container.left, container.width - width)));
    }
    toggleDropdown(chip.id);
  }

  function onRemove(chip: RowChip, e: MouseEvent) {
    e.stopPropagation();
    if (chip.kind === "category") toggleCategory(chip.slug);
    else if (chip.kind === "subcategory") toggleSubcategory(chip.slug);
    else if (chip.kind === "dropdown" || chip.kind === "active") clearChip(chip.id);
    scrollToStart();
  }

  return (
    // A full-width band under the nav with the same glass as the nav (no divider), so the two read as
    // one bar; the content inside keeps the page's 80px margins.
    <div
      ref={bandRef}
      className={cn(
        "sticky top-24 z-30 w-full transition-shadow lg:top-[100px]",
        // On mobile the row is always the nav's glass, so it can never be see-through over the photos.
        "max-lg:bg-[rgba(255,255,255,0.93)] max-lg:backdrop-blur-md",
        // The first shadow is a 10px strip of the same glass above the row, tucked under the header. On phones the
        // fixed header and this sticky row can scroll a frame apart; the strip covers that gap so no content flashes
        // between them. The second is the soft shadow under the pair.
        stuck &&
          "bg-[rgba(255,255,255,0.93)] shadow-[0_-10px_0_0_rgba(255,255,255,0.93),0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md",
        // A blurred element becomes the containing block for fixed children, which would pin the mobile
        // date sheet to the row instead of the screen. No blur while it's open on mobile keeps it a true
        // bottom sheet.
        openDropdown && "max-md:backdrop-blur-none",
        className,
      )}
    >
      <div ref={containerRef} className="relative mx-auto w-full max-w-[1512px] px-6 lg:px-20">
        <div className="flex h-[52px] items-center lg:h-14">
          <div className="shrink-0 pr-2">
            <button
              type="button"
              onClick={openPanel}
              className={cn(CHIP, "gap-2", filterCount > 0 ? CHIP_DARK : CHIP_LIGHT)}
            >
              <Image
                src="/icons/search-results/sliders-01.svg"
                alt=""
                width={20}
                height={20}
                unoptimized
                className={cn(filterCount > 0 && "invert")}
              />
              More filters
              {filterCount > 0 && (
                <span className="flex size-6 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-[#1f1c20]">
                  {filterCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative min-w-0 flex-1">
            <div
              ref={scrollerRef}
              onScroll={updateArrows}
              // Fades the clipped chips with a mask, so it works on the glass band (no white overlay).
              style={{ maskImage: fadeMask(canScrollLeft, canScrollRight) }}
              className="flex items-center gap-2 overflow-x-auto py-1 pl-1 pr-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {rowChips.map((chip) => {
                const dark =
                  chip.kind === "category"
                    ? chip.selected
                    : chip.kind === "dropdown"
                      ? chip.active
                      : true;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    aria-pressed={chip.kind === "category" ? chip.selected : undefined}
                    aria-expanded={chip.kind === "dropdown" ? openDropdown === chip.id : undefined}
                    onClick={(e) => onChip(chip, e)}
                    className={cn(CHIP, dark ? CHIP_DARK : CHIP_LIGHT)}
                  >
                    {chip.kind === "dropdown" && chip.id === "dates" && (
                      <Image
                        src="/icons/search-results/calendar.svg"
                        alt=""
                        width={16}
                        height={16}
                        unoptimized
                        className={cn(dark && "invert")}
                      />
                    )}
                    {chip.label}
                    {chip.kind === "category" && chip.forYou && !chip.selected && (
                      <span aria-label="For you" role="img" className="size-1.5 rounded-full bg-[#1f1c20]" />
                    )}
                    {dark ? (
                      <RemoveX label={chip.label} onRemove={(e) => onRemove(chip, e)} />
                    ) : chip.kind === "dropdown" && chip.id !== "dates" ? (
                      <Image src="/icons/search-results/chevron-down.svg" alt="" width={16} height={16} unoptimized />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {canScrollLeft && (
              <button
                type="button"
                aria-label="Scroll filters left"
                onClick={() => scrollBy(-1)}
                className="absolute left-0 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#f4f2ee] transition-colors hover:bg-[#e6e2dc] cursor-pointer lg:flex"
              >
                <Image src="/icons/search-results/chevron-right.svg" alt="" width={18} height={18} unoptimized className="rotate-180" />
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                aria-label="Scroll filters right"
                onClick={() => scrollBy(1)}
                className="absolute right-0 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#f4f2ee] transition-colors hover:bg-[#e6e2dc] cursor-pointer lg:flex"
              >
                <Image src="/icons/search-results/chevron-right.svg" alt="" width={18} height={18} unoptimized />
              </button>
            )}
          </div>
        </div>

        {/* Taste quiz taken: a sub-row slides in under the row for each selected category (two at most). */}
        {subRows.map((row) => (
          <div
            key={row.parentSlug}
            className="flex h-12 items-center gap-2 overflow-x-auto pb-1 animate-in fade-in slide-in-from-top-2 duration-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <span className="shrink-0 truncate pl-1 pr-2 font-sans text-sm text-[#6f6b72]">{row.title}</span>
            <button
              type="button"
              aria-pressed={row.allSelected}
              onClick={() => selectAllSubcategories(row.parentSlug)}
              className={cn(CHIP, "h-9 text-sm", row.allSelected ? CHIP_DARK : CHIP_LIGHT)}
            >
              All {row.title}
            </button>
            {row.items.map((item) => (
              <button
                key={item.slug}
                type="button"
                aria-pressed={item.selected}
                onClick={() => toggleSubcategory(item.slug)}
                className={cn(CHIP, "h-9 text-sm", item.selected ? CHIP_DARK : CHIP_LIGHT)}
              >
                {item.label}
                {item.selected && <X className="-mr-1 size-4" />}
              </button>
            ))}
          </div>
        ))}

        {/* Dropdowns sit outside the scroller so its overflow can't clip them. On mobile the wrapper
            disappears and the date picker becomes a bottom sheet. */}
        <div className="absolute top-full z-40 pt-2 max-md:contents" style={{ left: anchorLeft }}>
          <FilterDropdownView {...props} className={undefined} />
        </div>
      </div>
    </div>
  );
}
