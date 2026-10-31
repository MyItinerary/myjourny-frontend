import type { ListingFilterGroup, ListingFilterParams, ListingFilterState } from "./listing-filters.types";

// Ranges sized to what's listed: most tickets are ₦5,000–₦10,000 and most
// experiences run 1.5–4 hours. Time of day is "day" or "night" on listings.
export const LISTING_FILTER_GROUPS: ListingFilterGroup[] = [
  {
    id: "price",
    label: "Price",
    options: [
      { id: "under-5000", label: "Under ₦5,000", params: { price_max: 5000 } },
      { id: "5000-10000", label: "₦5,000 – ₦10,000", params: { price_min: 5000, price_max: 10000 } },
      { id: "10000-25000", label: "₦10,000 – ₦25,000", params: { price_min: 10000, price_max: 25000 } },
      { id: "over-25000", label: "Over ₦25,000", params: { price_min: 25000 } },
    ],
  },
  {
    id: "duration",
    label: "Duration",
    options: [
      { id: "up-to-2h", label: "Up to 2 hours", params: { duration_max: 120 } },
      { id: "2-4h", label: "2 – 4 hours", params: { duration_min: 121, duration_max: 240 } },
      { id: "over-4h", label: "More than 4 hours", params: { duration_min: 241 } },
    ],
  },
  {
    id: "time",
    label: "Time of day",
    options: [
      { id: "day", label: "Daytime", params: { time_of_day: "day" } },
      { id: "night", label: "Evening & night", params: { time_of_day: "night" } },
    ],
  },
];

/** The picked options as one set of query params. */
export function toFilterParams(state: ListingFilterState): ListingFilterParams {
  return LISTING_FILTER_GROUPS.reduce<ListingFilterParams>((params, group) => {
    const option = group.options.find((o) => o.id === state[group.id]);
    return option ? { ...params, ...option.params } : params;
  }, {});
}
