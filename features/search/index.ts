// Public API of the search feature. Other code imports only from here.
export type {
  ActivitySuggestion,
  DestinationSuggestion,
  ExperienceSuggestion,
  GuestCounts,
  SearchBarVariant,
  SearchExperiencesParams,
  SearchTab,
} from "./model/search.types";
export {
  DEFAULT_ACTIVITIES,
  DEFAULT_DESTINATIONS,
  FALLBACK_IMAGE,
  formatExperienceSubtitle,
  searchExperiencesQueryKey,
  useSearchExperiences,
} from "./model/search";

export type {
  SearchBarViewModel,
  UseSearchBarViewModelOptions,
} from "./view-model/use-search-bar-view-model";
export { GUEST_TYPES, useSearchBarViewModel } from "./view-model/use-search-bar-view-model";

export type { SearchBarViewProps } from "./view/search-bar-view";
export { SearchBarView } from "./view/search-bar-view";

export type { MobileSearchModalViewProps } from "./view/mobile-search-modal-view";
export { MobileSearchModalView } from "./view/mobile-search-modal-view";

export type {
  ExperienceSuggestionItemProps,
  SearchSuggestionListProps,
} from "./view/search-suggestion-item-view";
export {
  ExperienceSuggestionItem,
  ExperienceSuggestionThumbnail,
  SearchSuggestionList,
} from "./view/search-suggestion-item-view";

export type { WhoGuestsDropdownViewProps } from "./view/who-guests-dropdown-view";
export { WhoGuestsDropdownView } from "./view/who-guests-dropdown-view";
