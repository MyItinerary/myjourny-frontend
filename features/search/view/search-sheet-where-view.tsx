"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import type {
  SearchSheetViewModel,
  SheetListRow,
  SheetMatchGroup,
  SheetMatchRow,
  SheetRowIcon,
} from "../view-model/use-search-sheet-view-model";
import { ExperienceSuggestionThumbnail } from "./search-suggestion-item-view";

// Shared by the sheet's cards.
export const OPEN_CARD = "flex flex-col px-5 pt-[22px]";
export const CARD_TITLE = "font-sans text-[26px] font-extrabold leading-[31.2px] text-[#333134]";
export const NO_SCROLLBAR = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const GROUP_LABEL = "text-sm font-medium text-[#6F6B72]";

/** The open Where card (Figma 2A, 2B): the field, then recent searches and suggestions, or the matches while typing. */
export function WhereCardView(vm: SearchSheetViewModel) {
  const { editing, whereQuery } = vm;
  const typing = editing && !!whereQuery.trim();
  return (
    <div className={cn(OPEN_CARD, "min-h-0 flex-1", editing && "pt-4")}>
      {!editing && (
        <div className="h-12 shrink-0 pb-4">
          <h2 className={CARD_TITLE}>Where to?</h2>
        </div>
      )}
      <label className={cn("flex h-[52px] shrink-0 items-center gap-3 rounded-[14px] bg-[#F5F3EF] pl-4", typing ? "pr-2" : "pr-4")}>
        <Image src="/icons/search/search.svg" alt="" width={20} height={20} unoptimized className="shrink-0" />
        <input
          type="search"
          enterKeyHint="search"
          aria-label="Search destination or activities"
          placeholder="Search destination or activities"
          value={whereQuery}
          onFocus={vm.onWhereFocus}
          onChange={(e) => vm.onWhereChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") vm.onSearch();
          }}
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#333134] caret-[#F5032D] outline-none placeholder:text-[#6F6B72] [&::-webkit-search-cancel-button]:hidden"
        />
        {typing && (
          <button type="button" aria-label="Clear" onClick={vm.onClearWhere} className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
            <Image src="/icons/search/clear.svg" alt="" width={20} height={20} unoptimized />
          </button>
        )}
      </label>

      {typing ? (
        <ScrollArea className="pt-[10px]">
          {vm.noMatch ? (
            <p className="py-2 text-[15px] leading-[22px] text-[#333134]">Nothing matches yet. Try an area or a category.</p>
          ) : (
            vm.matchGroups.map((group, index) => <MatchGroup key={group.key} group={group} first={index === 0} />)
          )}
        </ScrollArea>
      ) : (
        <ScrollArea className="pt-[18px]">
          {vm.recentSearches.length > 0 && (
            <>
              <div className="flex h-6 items-center justify-between">
                <p className={GROUP_LABEL}>Recent searches</p>
                <button type="button" onClick={vm.onClearRecentSearches} className="cursor-pointer text-sm font-medium text-[#333134] underline">
                  Clear
                </button>
              </div>
              {vm.recentSearches.map((row) => (
                <PlaceRow key={row.key} row={row} />
              ))}
            </>
          )}
          <p className={cn("flex items-center", GROUP_LABEL, vm.recentSearches.length > 0 ? "h-9 pt-3" : "h-6")}>Suggested</p>
          <PlaceRow row={vm.nearby} />
          <ListSection label="Destinations" rows={vm.destinations} />
          <ListSection label="Popular areas in Lagos" rows={vm.popularAreas} />
          <ListSection label="Activities & experiences" rows={vm.activities} />
          {vm.tasteQuizHref && (
            <div className="pt-2">
              <Link href={vm.tasteQuizHref} onClick={vm.onClose} className="flex w-full items-center gap-[14px]">
                <PlaceTile icon="place" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-medium text-[#333134]">Make it mine.</span>
                  <span className="text-sm text-[#6F6B72]">Take the taste quiz for better picks.</span>
                </span>
              </Link>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}

/** The card's list: it scrolls inside the card, with a fade (and a chevron) where there's more. */
function ScrollArea({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.scrollTop <= 0;
    const end = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setEdges((prev) => (prev.top === top && prev.end === end ? prev : { top, end }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className="relative -mx-5 flex min-h-0 flex-1 flex-col">
      <div ref={ref} onScroll={measure} className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-3", NO_SCROLLBAR, className)}>
        <div className="flex flex-col">{children}</div>
      </div>
      {!edges.top && <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-white/0" />}
      {!edges.end && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center bg-gradient-to-b from-white/0 to-white to-70% pb-2">
          <Image src="/icons/search/chevron-down.svg" alt="" width={20} height={20} unoptimized />
        </div>
      )}
    </div>
  );
}

const TILE_ICONS: Record<SheetRowIcon, string> = {
  place: "/icons/search/area.svg",
  location: "/icons/search/location.svg",
  category: "/icons/search/category.svg",
};

function PlaceTile({ icon }: { icon: SheetRowIcon }) {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-[#F5F3EF]">
      <Image src={TILE_ICONS[icon]} alt="" width={22} height={22} unoptimized />
    </span>
  );
}

function ListSection({ label, rows }: { label: string; rows: SheetListRow[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <p className={cn("flex h-8 items-center pt-2", GROUP_LABEL)}>{label}</p>
      {rows.map((row) => (
        <PlaceRow key={row.key} row={row} />
      ))}
    </>
  );
}

/** Figma "Search Card A/B": a place, with what was searched under it when there's a subtitle. */
function PlaceRow({ row }: { row: SheetListRow }) {
  return (
    <button type="button" onClick={row.onSelect} className="flex h-16 w-full shrink-0 cursor-pointer items-center gap-[14px] text-left">
      <PlaceTile icon={row.icon} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-base font-medium text-[#333134]">{row.title}</span>
        {row.subtitle && <span className="truncate text-sm text-[#6F6B72]">{row.subtitle}</span>}
      </span>
    </button>
  );
}

function MatchGroup({ group, first }: { group: SheetMatchGroup; first: boolean }) {
  return (
    <>
      <p className={cn("flex items-center text-[13px] font-medium text-[#6F6B72]", first ? "h-[22px]" : "h-[26px] pt-1")}>{group.label}</p>
      {group.rows.map((row) => (
        <MatchRow key={row.key} row={row} />
      ))}
    </>
  );
}

function MatchTile({ row }: { row: SheetMatchRow }) {
  if (row.image) {
    return <ExperienceSuggestionThumbnail src={row.image.src} fallback={row.image.fallback} alt="" className="size-10 rounded-[12px]" />;
  }
  const icon =
    row.kind === "event"
      ? { src: "/icons/search/ticket.svg", size: 16 }
      : row.kind === "category"
        ? { src: TILE_ICONS.category, size: 20 }
        : { src: TILE_ICONS.location, size: 20 };
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F5F3EF]">
      <Image src={icon.src} alt="" width={icon.size} height={icon.size} unoptimized />
    </span>
  );
}

function MatchRow({ row }: { row: SheetMatchRow }) {
  return (
    <button type="button" onClick={row.onSelect} className="flex h-[54px] w-full shrink-0 cursor-pointer items-center gap-3 text-left">
      <MatchTile row={row} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          {/* The typed letters are bold. */}
          <span className="truncate text-[15px] text-[#333134]">
            {row.title.map((segment, i) =>
              segment.match ? (
                <b key={i} className="font-bold">
                  {segment.text}
                </b>
              ) : (
                <span key={i}>{segment.text}</span>
              ),
            )}
          </span>
          {row.kind === "event" && <Image src="/icons/search/ticket.svg" alt="" width={16} height={16} unoptimized className="shrink-0" />}
        </span>
        <span className="truncate text-[13px] text-[#6F6B72]">{row.subtitle}</span>
      </span>
    </button>
  );
}

