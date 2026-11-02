import { useCallback, useMemo, useState } from "react";

import { useTasteQuizAudience, useTasteQuizCtaViewModel } from "@/features/taste-quiz-cta";
import { apiErrorMessage } from "@/lib/api-error";
import { experienceListItemToCardProps } from "@/lib/queries/experiences";

import { ALL_CATEGORIES, FOR_YOU_CATEGORY_SLUGS, PRICE_QUICK_RANGES, SUBCATEGORIES } from "../model/filter-catalog";
import { buildDropdownGroups, buildPanel, isTonight, isWeekend } from "../model/search-panel";
import {
  activeType,
  buildResultsHeading,
  buildRowChips,
  buildSubRows,
  countActiveFilters,
  dateRangeFromLink,
  EMPTY_FILTERS,
  formatResultsCount,
  normalizeFilters,
  PRICE_CEILING,
  resultsNoun,
  toggleType as toggleTypeIn,
  UNDER_15K,
  useResultsListing,
} from "../model/search-results";
import type {
  ActiveChipId,
  DateRange,
  DropdownFilterId,
  DurationBand,
  ListingType,
  PriceRange,
  ResultsFilters,
  TimeOfDay,
} from "../model/search-results.types";

const PAGE_SIZE = 16;
const SUB_PARENT = new Map(SUBCATEGORIES.map((s) => [s.slug, s.parentSlug]));
const MAX_GROUP_SIZE = 50;
const DAY = 24 * 60 * 60 * 1000;

export interface UseSearchResultsViewModelOptions {
  /** What was searched for, as the page heading is worded from it. */
  subject: { kind: "city" | "category" | "query"; label: string };
  city?: string;
  /** The category slug a category page lists; chips picked in the row replace it. */
  interest?: string;
  search?: string;
  /** The first day from the results link (YYYY-MM-DD). */
  date?: string;
  /** The last day of a range from the results link. */
  until?: string;
}

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function comingWeekend(): DateRange {
  const t = today();
  const saturday = new Date(t.getFullYear(), t.getMonth(), t.getDate() + ((6 - t.getDay() + 7) % 7));
  return { start: saturday, end: new Date(saturday.getTime() + DAY) };
}

export function useSearchResultsViewModel({ subject, city, interest, search, date, until }: UseSearchResultsViewModelOptions) {
  const [filters, setFilters] = useState<ResultsFilters>(() => ({ ...EMPTY_FILTERS, dateRange: dateRangeFromLink(date, until) }));
  // Set when choosing or clearing a type removed filters that no longer apply.
  const [clearedNote, setClearedNote] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownFilterId | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  // The date picker applies on "Apply", everything else is live.
  const [draftRange, setDraftRange] = useState<DateRange>(EMPTY_FILTERS.dateRange);

  // A new search from the nav can land on the same page with other dates.
  const linkDates = `${date ?? ""}|${until ?? ""}`;
  const [seenLinkDates, setSeenLinkDates] = useState(linkDates);
  if (linkDates !== seenLinkDates) {
    setSeenLinkDates(linkDates);
    setFilters((f) => ({ ...f, dateRange: dateRangeFromLink(date, until) }));
  }

  const tookQuiz = useTasteQuizAudience() === "taken";
  const quizHref = useTasteQuizCtaViewModel().href;
  const listing = useResultsListing({ city, interest, search, filters, pageSize: PAGE_SIZE });

  const items = useMemo(
    () => (listing.data?.pages ?? []).flatMap((p) => p.items).map(experienceListItemToCardProps),
    [listing.data],
  );
  const total = listing.data?.pages[0]?.total;

  const update = useCallback((change: (f: ResultsFilters) => ResultsFilters) => {
    setFilters((prev) => normalizeFilters(change(prev)));
    setClearedNote(null);
  }, []);

  const toggleCategory = useCallback(
    (slug: string) =>
      update((f) => ({
        ...f,
        categories: f.categories.includes(slug) ? f.categories.filter((s) => s !== slug) : [slug, ...f.categories],
      })),
    [update],
  );

  const toggleSubcategory = useCallback(
    (slug: string) =>
      update((f) => ({
        ...f,
        subcategories: f.subcategories.includes(slug) ? f.subcategories.filter((s) => s !== slug) : [slug, ...f.subcategories],
      })),
    [update],
  );

  /** "All {category}": clears that category's subcategories. */
  const selectAllSubcategories = useCallback(
    (parentSlug: string) =>
      update((f) => ({
        ...f,
        subcategories: f.subcategories.filter((s) => !(parentSlug && SUB_PARENT.get(s) === parentSlug)),
      })),
    [update],
  );

  const toggleType = useCallback(
    (type: ListingType) => {
      const result = toggleTypeIn(filters, type);
      setFilters(result.filters);
      setClearedNote(result.cleared > 0 ? result.cleared : null);
    },
    [filters],
  );

  const toggleDropdown = useCallback(
    (id: DropdownFilterId) => {
      setOpenDropdown((current) => (current === id ? null : id));
      if (id === "dates") setDraftRange(filters.dateRange);
    },
    [filters.dateRange],
  );
  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  const pickDate = useCallback((date: Date) => {
    setDraftRange((range) => {
      // First tap sets the start, the second the end; the same day twice is one day.
      if (!range.start || range.end) return { start: date, end: null };
      return date < range.start ? { start: date, end: null } : { start: range.start, end: date };
    });
  }, []);
  const pickDatePreset = useCallback((start: Date, end: Date) => setDraftRange({ start, end }), []);

  const applyDates = useCallback(() => {
    const { start, end } = draftRange;
    update((f) => ({ ...f, dateRange: { start, end: end ?? start } }));
    setOpenDropdown(null);
  }, [draftRange, update]);

  const clearDates = useCallback(() => {
    setDraftRange(EMPTY_FILTERS.dateRange);
    update((f) => ({ ...f, dateRange: EMPTY_FILTERS.dateRange }));
  }, [update]);

  const setPrice = useCallback((price: PriceRange) => update((f) => ({ ...f, price, free: false })), [update]);
  const toggleFree = useCallback(
    () => update((f) => ({ ...f, free: !f.free, price: EMPTY_FILTERS.price })),
    [update],
  );

  const toggleOption = useCallback(
    (groupId: string, value: string) =>
      update((f) => {
        if (groupId === "timeOfDay") return { ...f, timeOfDay: f.timeOfDay === value ? null : (value as TimeOfDay) };
        if (groupId === "duration") return { ...f, duration: f.duration === value ? null : (value as DurationBand) };
        const list = groupId === "languages" ? f.languages : (f.groups[groupId] ?? []);
        const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
        return groupId === "languages" ? { ...f, languages: next } : { ...f, groups: { ...f.groups, [groupId]: next } };
      }),
    [update],
  );

  const setFlag = useCallback((id: string, on: boolean) => update((f) => ({ ...f, flags: { ...f.flags, [id]: on } })), [update]);
  const setGroupSize = useCallback(
    (size: number) => update((f) => ({ ...f, groupSize: Math.min(MAX_GROUP_SIZE, Math.max(1, size)) })),
    [update],
  );

  const clearChip = useCallback(
    (id: ActiveChipId | DropdownFilterId) => {
      if (id === "type") {
        const type = activeType(filters);
        if (type) toggleType(type);
        return;
      }
      if (id === "dates") setDraftRange(EMPTY_FILTERS.dateRange);
      update((f) => ({
        ...f,
        ...(id === "dates" && { dateRange: EMPTY_FILTERS.dateRange }),
        ...(id === "price" && { price: EMPTY_FILTERS.price, free: false }),
        ...(id === "timeOfDay" && { timeOfDay: null }),
        ...(id === "duration" && { duration: null }),
        ...(id === "languages" && { languages: [] }),
        ...(id === "age" && { groups: { ...f.groups, age: [] } }),
      }));
    },
    [filters, toggleType, update],
  );

  const clearAll = useCallback(() => {
    setDraftRange(EMPTY_FILTERS.dateRange);
    setFilters(EMPTY_FILTERS);
    setClearedNote(null);
  }, []);

  const panel = useMemo(() => buildPanel(filters, { tookQuiz }), [filters, tookQuiz]);

  const pickTonight = useCallback(() => {
    const t = today();
    update((f) => ({ ...f, dateRange: isTonight(f) ? EMPTY_FILTERS.dateRange : { start: t, end: t } }));
  }, [update]);
  const pickThisWeekend = useCallback(() => {
    update((f) => ({ ...f, dateRange: isWeekend(f) ? EMPTY_FILTERS.dateRange : comingWeekend() }));
  }, [update]);
  const toggleUnder15k = useCallback(
    () =>
      update((f) => ({
        ...f,
        free: false,
        price: !f.free && f.price.min === null && f.price.max === UNDER_15K.max ? EMPTY_FILTERS.price : UNDER_15K,
      })),
    [update],
  );
  const togglePickedForYou = useCallback(() => {
    update((f) => {
      const type = activeType(f);
      const own = FOR_YOU_CATEGORY_SLUGS.filter((s) => {
        const kind = ALL_CATEGORIES.find((c) => c.slug === s)?.kind;
        return type === null || kind === type;
      });
      const allOn = own.every((s) => f.categories.includes(s));
      return {
        ...f,
        categories: allOn
          ? f.categories.filter((s) => !own.includes(s))
          : [...own.filter((s) => !f.categories.includes(s)).reverse(), ...f.categories],
      };
    });
  }, [update]);

  const filterCount = countActiveFilters(filters);
  const noun = total === undefined ? "results" : resultsNoun(filters, total);

  return {
    heading: buildResultsHeading(subject),
    countLabel: formatResultsCount(total, listing.isError && items.length === 0),
    total,
    footerLabel: total === undefined ? "Show results" : `Show ${total} ${noun}`,
    items,
    isLoading: listing.isPending,
    isEmpty: !listing.isPending && !listing.isError && items.length === 0,
    isError: listing.isError,
    errorMessage: listing.isError ? apiErrorMessage(listing.error, "Couldn't load experiences.") : undefined,
    onRetry: () => listing.refetch(),
    isLoadMoreError: listing.isFetchNextPageError,
    hasMore: listing.hasNextPage ?? false,
    isLoadingMore: listing.isFetchingNextPage,
    onLoadMore: () => listing.fetchNextPage(),
    filters,
    filterCount,
    hasActiveFilters: filterCount > 0,
    tookQuiz,
    quizHref,
    rowChips: buildRowChips(filters, { tookQuiz }),
    subRows: buildSubRows(filters, tookQuiz),
    dropdownGroups: buildDropdownGroups(filters),
    panel,
    clearedNote,
    openDropdown,
    draftRange,
    panelOpen,
    priceQuickRanges: PRICE_QUICK_RANGES,
    priceCeiling: PRICE_CEILING,
    toggleCategory,
    toggleSubcategory,
    selectAllSubcategories,
    toggleType,
    toggleDropdown,
    closeDropdown,
    pickDate,
    pickDatePreset,
    applyDates,
    clearDates,
    setPrice,
    toggleFree,
    toggleOption,
    setFlag,
    setGroupSize,
    clearChip,
    clearAll,
    pickTonight,
    pickThisWeekend,
    toggleUnder15k,
    togglePickedForYou,
    openPanel: () => {
      setOpenDropdown(null);
      setClearedNote(null);
      setPanelOpen(true);
    },
    closePanel: () => setPanelOpen(false),
  };
}

export type SearchResultsViewModel = ReturnType<typeof useSearchResultsViewModel>;
