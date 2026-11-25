import { vi } from "vitest";

import type { SearchSheetViewModel } from "@/features/search";

const day = (d: number) => new Date(2026, 10, d);

/** A complete phone search sheet view-model for view tests; override what a test cares about. */
export function buildSearchSheetVm(overrides: Partial<SearchSheetViewModel> = {}): SearchSheetViewModel {
  return {
    openCard: "where",
    onOpenCard: vi.fn(),
    onClose: vi.fn(),

    editing: false,
    whereQuery: "",
    whereSummary: "Add place",
    onWhereFocus: vi.fn(),
    onWhereChange: vi.fn(),
    onClearWhere: vi.fn(),
    recentSearches: [],
    onClearRecentSearches: vi.fn(),
    nearby: { key: "nearby", title: "Nearby", subtitle: "Find what's around you", icon: "place", onSelect: vi.fn() },
    destinations: [
      { key: "destination-lagos", title: "Lagos, Nigeria", subtitle: "28 experiences", icon: "location", onSelect: vi.fn() },
      { key: "destination-abuja", title: "Abuja, Nigeria", subtitle: "20 experiences", icon: "location", onSelect: vi.fn() },
    ],
    popularAreas: [
      { key: "popular-Lekki", title: "Lekki", icon: "location", onSelect: vi.fn() },
      { key: "popular-Yaba", title: "Yaba", icon: "location", onSelect: vi.fn() },
    ],
    activities: [
      {
        key: "activity-local-food-drinks",
        title: "Local food & drinks",
        subtitle: "Street eats, cafés, and culinary tours",
        icon: "category",
        onSelect: vi.fn(),
      },
    ],
    tasteQuizHref: null,
    matchGroups: [],
    noMatch: false,

    whenSummary: "Add dates",
    datePresets: [
      { id: "tonight", label: "Tonight", range: { start: day(20), end: day(20) }, selected: false },
      { id: "weekend", label: "This weekend", range: { start: day(21), end: day(22) }, selected: true },
      { id: "next-week", label: "Next week", range: { start: day(23), end: day(29) }, selected: false },
      { id: "anytime", label: "Anytime", range: null, selected: false },
    ],
    months: [
      {
        key: "2026-10",
        label: "November 2026",
        leadingBlanks: 6,
        days: [
          { date: day(19), day: 19, state: "past", selected: false, band: "none" },
          { date: day(20), day: 20, state: "today", selected: false, band: "none" },
          { date: day(21), day: 21, state: "default", selected: true, band: "start" },
          { date: day(22), day: 22, state: "default", selected: true, band: "end" },
          { date: day(23), day: 23, state: "default", selected: false, band: "none" },
        ],
      },
    ],
    onPickDay: vi.fn(),
    onPickPreset: vi.fn(),
    onSkipDates: vi.fn(),

    whoSummary: "Add guests",
    guestTypes: [
      { key: "adults", label: "Adults", description: "Aged 13 or above", count: 2, canRemove: true, canAdd: true },
      { key: "children", label: "Children", description: "Ages 2 - 12", count: 0, canRemove: false, canAdd: true },
      { key: "infants", label: "Infants", description: "Under 2", count: 0, canRemove: false, canAdd: true },
    ],
    onAddGuest: vi.fn(),
    onRemoveGuest: vi.fn(),

    searching: false,
    onClearAll: vi.fn(),
    onSearch: vi.fn(),

    viewportHeight: null,
    ...overrides,
  };
}
