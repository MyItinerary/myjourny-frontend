export type FilterOption = {
  value: string;
  label: string;
  selected: boolean;
  /** Listings' categories only: their subcategories. */
  subs: { value: string; selected: boolean }[];
};

/** One dropdown on a table's toolbar. */
export type FilterGroup = {
  key: string;
  label: string;
  /** What shows on the button: "Any", or the chosen value. */
  current: string;
  active: boolean;
  /** The value that clears this filter, and how its menu row reads ("Any status", "All dates"). */
  anyValue: string;
  anyLabel: string;
  options: FilterOption[];
};
