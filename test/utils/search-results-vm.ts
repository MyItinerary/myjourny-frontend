import { vi } from "vitest";

import {
  buildDropdownGroups,
  buildPanel,
  buildRowChips,
  buildSubRows,
  EMPTY_FILTERS,
  PRICE_CEILING,
  PRICE_QUICK_RANGES,
  type ResultsFilters,
  type SearchResultsViewModel,
} from "@/features/search-results";

/** The empty filters with some of them set. */
export const withFilters = (f: Partial<ResultsFilters>): ResultsFilters => ({ ...EMPTY_FILTERS, ...f });

/** A complete results view-model for view tests; override what a test cares about. */
export function buildResultsVm(
  overrides: Partial<SearchResultsViewModel> & { tookQuiz?: boolean } = {},
): SearchResultsViewModel {
  const filters = overrides.filters ?? EMPTY_FILTERS;
  const tookQuiz = overrides.tookQuiz ?? false;
  return {
    heading: "Things to do in Lagos",
    countLabel: "(50 results)",
    total: 50,
    footerLabel: "Show 50 results",
    items: [],
    isLoading: false,
    isEmpty: false,
    isError: false,
    errorMessage: undefined,
    onRetry: vi.fn(),
    isLoadMoreError: false,
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: vi.fn(),
    filters,
    filterCount: 0,
    hasActiveFilters: false,
    tookQuiz,
    quizHref: "/onboarding",
    rowChips: buildRowChips(filters, { tookQuiz }),
    subRows: buildSubRows(filters, tookQuiz),
    dropdownGroups: buildDropdownGroups(filters),
    panel: buildPanel(filters, { tookQuiz }),
    clearedNote: null,
    openDropdown: null,
    draftRange: { start: null, end: null },
    panelOpen: false,
    priceQuickRanges: PRICE_QUICK_RANGES,
    priceCeiling: PRICE_CEILING,
    toggleCategory: vi.fn(),
    toggleSubcategory: vi.fn(),
    selectAllSubcategories: vi.fn(),
    toggleType: vi.fn(),
    toggleDropdown: vi.fn(),
    closeDropdown: vi.fn(),
    pickDate: vi.fn(),
    pickDatePreset: vi.fn(),
    applyDates: vi.fn(),
    clearDates: vi.fn(),
    setPrice: vi.fn(),
    toggleFree: vi.fn(),
    toggleOption: vi.fn(),
    setFlag: vi.fn(),
    setGroupSize: vi.fn(),
    clearChip: vi.fn(),
    clearAll: vi.fn(),
    pickTonight: vi.fn(),
    pickThisWeekend: vi.fn(),
    toggleUnder15k: vi.fn(),
    togglePickedForYou: vi.fn(),
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    ...overrides,
  };
}
