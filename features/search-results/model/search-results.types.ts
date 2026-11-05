export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export type ListingType = "experiences" | "events";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "late_night";
export type DurationBand = "under_2h" | "2_to_4h" | "half_day" | "full_day";

/** One filter state drives both the filter row and the "More filters" panel. */
export interface ResultsFilters {
  /** Neither or both chosen means everything. One chosen limits the row and adds its own filters. */
  types: ListingType[];
  /** Selected category slugs, newest first. */
  categories: string[];
  /** Selected subcategory slugs, newest first. Only people who took the taste quiz can pick these. */
  subcategories: string[];
  dateRange: DateRange;
  price: PriceRange;
  free: boolean;
  timeOfDay: TimeOfDay | null;
  duration: DurationBand | null;
  languages: string[];
  /** Selected options of the other chip groups, by group id (area, setting, age, genre, …). */
  groups: Record<string, string[]>;
  /** The on/off filters, by id (verifiedHost, hideSoldOut, …). */
  flags: Record<string, boolean>;
  /** Experiences only. 1 means no filter. */
  groupSize: number;
}

/** The chips in the row that open a dropdown. */
export type DropdownFilterId = "dates" | "duration" | "languages" | "age";

/** Chips for a filter set in the panel: shown in the row only once active, with an X. */
export type ActiveChipId = "type" | "price" | "timeOfDay";

export type RowChip =
  | { kind: "category"; key: string; slug: string; label: string; selected: boolean }
  | { kind: "subcategory"; key: string; slug: string; label: string; selected: boolean }
  | { kind: "dropdown"; key: string; id: DropdownFilterId; label: string; active: boolean }
  | { kind: "active"; key: string; id: ActiveChipId; label: string };

export interface OptionChoice<T extends string> {
  value: T;
  label: string;
}

/** One option of a chip group in the panel. */
export interface PanelOption {
  value: string;
  label: string;
  selected: boolean;
  disabled: boolean;
}

export interface PanelGroup {
  id: string;
  label: string;
  options: PanelOption[];
}

export type PanelBlock =
  | { kind: "group"; group: PanelGroup }
  | { kind: "flags"; items: { id: string; label: string; on: boolean }[] }
  | { kind: "stepper"; id: "groupSize"; label: string; value: number };

export type FeaturedId = "pickedForYou" | "tonight" | "weekend" | "free" | "under15k";

export interface PanelCategory {
  slug: string;
  label: string;
  kind: ListingType;
  selected: boolean;
}

/** Everything the "More filters" panel shows for the current filters, in order. */
export interface PanelModel {
  types: { value: ListingType; label: string; selected: boolean }[];
  featured: { id: FeaturedId; label: string; selected: boolean }[];
  /** Empty once the taste quiz is taken (see `subcategories`). */
  categoryGroups: { title: string | null; items: PanelCategory[] }[];
  /** Taste quiz taken: the subcategories on their own, instead of the categories. Null otherwise
   * (events have no subcategories, so they keep their categories). */
  subcategories: { slug: string; label: string; selected: boolean }[] | null;
  /** No quiz yet: the prompt that unlocks subcategories. */
  showQuizPrompt: boolean;
  collections: PanelGroup;
  place: PanelGroup[];
  timeOfDay: PanelGroup;
  whoItSuits: PanelGroup[];
  /** The Experiences or Events section, once exactly one type is chosen. */
  typeSection: { title: string; blocks: PanelBlock[] } | null;
}
