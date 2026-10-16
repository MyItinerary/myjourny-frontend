import type { ListingStatus } from "./home.types";

export type HostListing = {
  id: string;
  imageUrl: string;
  title: string;
  /** "Lagos Island · 3 hours" */
  sub: string;
  cat: string;
  subcat: string;
  status: ListingStatus;
  /** Naira per guest. */
  price: number;
  /** "Sat 20 Sept", "Not set", "Paused". Sorted as text, as drawn. */
  next: string;
  /** "6 of 8", "0", "11 total", "2 upcoming" */
  bookings: string;
  /** "4.9", or "-" when unrated. */
  rating: string;
  /** Bookings still to come; any block deleting. */
  future: number;
};

export type ListingSortKey = "title" | "cat" | "status" | "price" | "next" | "bookings" | "rating";

export type RatingFilter = "All" | "4.5 and up" | "4 and up" | "Not rated yet";

export type ListingFilters = {
  q: string;
  /** A status, or "All". */
  status: ListingStatus | "All";
  /** A category, or "All". */
  category: string;
  /** A subcategory of that category, or "All". */
  subcategory: string;
  rating: RatingFilter;
};

export type ListingRowAction =
  | "edit"
  | "duplicate"
  | "preview"
  | "copy-link"
  | "hide"
  | "show"
  | "pause"
  | "archive"
  | "delete";

export type BulkAction = "hide" | "pause" | "archive";
