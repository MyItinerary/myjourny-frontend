/** The query params /experiences/filter and /experiences/recommendations both take. */
export type ListingFilterParams = {
  price_min?: number;
  price_max?: number;
  duration_min?: number;
  duration_max?: number;
  time_of_day?: string;
};

export type ListingFilterGroupId = "price" | "duration" | "time";

export type ListingFilterOption = {
  id: string;
  label: string;
  params: ListingFilterParams;
};

export type ListingFilterGroup = {
  id: ListingFilterGroupId;
  label: string;
  options: ListingFilterOption[];
};

/** The option picked in each group, if any. */
export type ListingFilterState = Partial<Record<ListingFilterGroupId, string>>;
