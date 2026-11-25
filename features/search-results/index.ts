// Public API of the search-results feature. Other code imports only from here.
export type {
  ActiveChipId,
  DateRange,
  DropdownFilterId,
  ListingType,
  PanelModel,
  PriceRange,
  ResultsFilters,
  RowChip,
} from "./model/search-results.types";
export {
  buildResultsHeading,
  buildRowChips,
  countActiveFilters,
  EMPTY_FILTERS,
  formatResultsCount,
  PRICE_CEILING,
} from "./model/search-results";
export { buildDropdownGroups, buildPanel } from "./model/search-panel";
export { PRICE_QUICK_RANGES } from "./model/filter-catalog";

export type {
  SearchResultsViewModel,
  UseSearchResultsViewModelOptions,
} from "./view-model/use-search-results-view-model";
export { useSearchResultsViewModel } from "./view-model/use-search-results-view-model";

export type { ResultsFilterRowViewProps } from "./view/results-filter-row-view";
export { ResultsFilterRowView } from "./view/results-filter-row-view";
export type { MoreFiltersDialogViewProps } from "./view/more-filters-dialog-view";
export { MoreFiltersDialogView } from "./view/more-filters-dialog-view";
export type { EmptyResultsViewProps } from "./view/empty-results-view";
export { EmptyResultsView } from "./view/empty-results-view";
