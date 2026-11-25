import type { CalendarMonth, DatePreset } from "../model/search-sheet.types";
import type { GuestCounts, SearchTab } from "../model/search.types";
import type { SheetListRow, SheetMatchGroup } from "./search-sheet-rows";

export interface SheetDatePreset extends DatePreset {
  selected: boolean;
}

export interface SheetGuestType {
  key: keyof GuestCounts;
  label: string;
  description: string;
  count: number;
  canRemove: boolean;
  canAdd: boolean;
}

export interface SearchSheetViewModel {
  openCard: SearchTab | null;
  onOpenCard: (card: SearchTab) => void;
  onClose: () => void;

  /** Typing in Where: the card shows the predictive matches, and When and Who step aside. */
  editing: boolean;
  whereQuery: string;
  whereSummary: string;
  onWhereFocus: () => void;
  onWhereChange: (value: string) => void;
  onClearWhere: () => void;
  recentSearches: SheetListRow[];
  onClearRecentSearches: () => void;
  nearby: SheetListRow;
  /** Cities with experiences, from the API, as the search has always listed them. */
  destinations: SheetListRow[];
  popularAreas: SheetListRow[];
  activities: SheetListRow[];
  /** The taste quiz row at the end of the list, for people who haven't taken it. */
  tasteQuizHref: string | null;
  matchGroups: SheetMatchGroup[];
  noMatch: boolean;

  whenSummary: string;
  datePresets: SheetDatePreset[];
  months: CalendarMonth[];
  onPickDay: (date: Date) => void;
  onPickPreset: (preset: DatePreset) => void;
  onSkipDates: () => void;

  whoSummary: string;
  guestTypes: SheetGuestType[];
  onAddGuest: (key: keyof GuestCounts) => void;
  onRemoveGuest: (key: keyof GuestCounts) => void;

  searching: boolean;
  onClearAll: () => void;
  onSearch: () => void;

  /** The visible height above the on-screen keyboard, so the footer rides on it. Null until known. */
  viewportHeight: number | null;
}
