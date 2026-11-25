import { useSyncExternalStore } from "react";

import { parseIsoDay, toIsoDay } from "@/lib/dates";

import type { DateRange, GuestCounts } from "./search.types";

const KEY = "myjourny:recent-searches";
const MAX = 3;
const listeners = new Set<() => void>();

/** A search someone ran from the phone search sheet, kept in this browser only. */
export interface RecentSearch {
  where: string;
  /** YYYY-MM-DD, or null for any date. */
  start: string | null;
  end: string | null;
  guests: GuestCounts;
}

const EMPTY: RecentSearch[] = [];
let cachedRaw: string | null = null;
let cached: RecentSearch[] = EMPTY;

function isRecentSearch(value: unknown): value is RecentSearch {
  const v = value as RecentSearch;
  return !!v && typeof v.where === "string" && !!v.guests && typeof v.guests.adults === "number";
}

/** The newest first; empty when there are none or storage is blocked. */
export function readRecentSearches(): RecentSearch[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  // useSyncExternalStore needs the same array back while nothing changed.
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.filter(isRecentSearch).slice(0, MAX) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function write(searches: RecentSearch[]) {
  try {
    if (searches.length) window.localStorage.setItem(KEY, JSON.stringify(searches));
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: there just won't be recent searches.
  }
  listeners.forEach((listener) => listener());
}

/** Puts a search at the top, dropping an older one for the same place. */
export function saveRecentSearch({ where, dates, guests }: { where: string; dates: DateRange; guests: GuestCounts }) {
  const trimmed = where.trim();
  if (!trimmed) return;
  const entry: RecentSearch = {
    where: trimmed,
    start: dates.start ? toIsoDay(dates.start) : null,
    end: dates.start ? toIsoDay(dates.end ?? dates.start) : null,
    guests: { adults: guests.adults, children: guests.children, infants: guests.infants },
  };
  const rest = readRecentSearches().filter((s) => s.where.toLowerCase() !== trimmed.toLowerCase());
  write([entry, ...rest].slice(0, MAX));
}

export function clearRecentSearches() {
  write([]);
}

export function recentSearchDates(search: RecentSearch): DateRange {
  return { start: parseIsoDay(search.start), end: parseIsoDay(search.end) };
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** Recent searches; empty on the server. */
export function useRecentSearches(): RecentSearch[] {
  return useSyncExternalStore(subscribe, readRecentSearches, () => EMPTY);
}
