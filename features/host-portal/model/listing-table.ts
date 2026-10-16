import type { ListingStatus } from "./home.types";
import type {
  HostListing,
  ListingFilters,
  ListingRowAction,
  ListingSortKey,
  RatingFilter,
} from "./listings.types";
import { formatNaira } from "./money";

export const STATUS_OPTIONS: ListingStatus[] = ["Live", "Draft", "In review", "Hidden", "Paused", "Sold out", "Archived", "Rejected"];

export const RATING_OPTIONS: RatingFilter[] = ["All", "4.5 and up", "4 and up", "Not rated yet"];

// Category -> its subcategories, as the listing builder offers them.
export const CATEGORY_TREE: Record<string, string[]> = {
  "Local food & drinks": ["Street food walk", "Market to table", "Cooking class", "Supper club", "Drinks and tasting"],
  "Culture & history": ["Guided history walk", "Museum and gallery", "Architecture walk", "Religious sites", "Storytelling evening"],
  "Nature & outdoors": ["Hike or trail walk", "Cycling", "Birdwatching", "Conservation visit", "Picnic and open air"],
  "Art & creativity": ["Photography walk", "Pottery and ceramics", "Painting and drawing", "Textiles and beading", "Music and recording"],
  "Wellness & calm": ["Yoga", "Breathwork and meditation", "Sound bath", "Spa and hammam", "Fitness class"],
  "Street life": ["Night market walk", "Neighbourhood walk", "Thrift and vintage", "Barbershop and salon", "Football and street games"],
  "Events & live shows": ["Live music", "Comedy night", "Theatre and dance", "Listening session", "Film screening"],
  "Water activity": ["Kayak and canoe", "Boat cruise", "Swimming and beach", "Fishing", "Surf and paddleboard"],
};

export const NO_FILTERS: ListingFilters = { q: "", status: "All", category: "All", subcategory: "All", rating: "All" };

export const hasActiveFilters = (f: ListingFilters) =>
  f.status !== "All" || f.category !== "All" || f.subcategory !== "All" || f.rating !== "All" || f.q !== "";

function ratingOk(listing: HostListing, filter: RatingFilter) {
  const r = parseFloat(listing.rating);
  if (filter === "All") return true;
  if (filter === "Not rated yet") return Number.isNaN(r);
  if (filter === "4.5 and up") return r >= 4.5;
  return r >= 4;
}

export function filterListings(listings: HostListing[], f: ListingFilters): HostListing[] {
  const q = f.q.toLowerCase();
  return listings.filter(
    (l) =>
      (f.status === "All" || l.status === f.status) &&
      (f.category === "All" || l.cat === f.category) &&
      (f.subcategory === "All" || l.subcat === f.subcategory) &&
      ratingOk(l, f.rating) &&
      l.title.toLowerCase().includes(q),
  );
}

const sortValue = (l: HostListing, key: ListingSortKey) =>
  key === "price" ? l.price : key === "title" ? l.title.toLowerCase() : l[key];

/** Sorted copy. `dir` is 1 for ascending, -1 for descending. Values compare as
 * the table draws them: prices as numbers, everything else as text. */
export function sortListings(listings: HostListing[], key: ListingSortKey, dir: 1 | -1): HostListing[] {
  return listings.slice().sort((a, b) => {
    const x = sortValue(a, key);
    const y = sortValue(b, key);
    return x === y ? 0 : (x > y ? 1 : -1) * dir;
  });
}

/** "All 8 listings", "1 listing", "3 listings" */
export function resultLine(shown: number, total: number): string {
  if (shown === total) return `All ${total} listings`;
  return shown === 1 ? "1 listing" : `${shown} listings`;
}

/** "8 listings · 1 live · 1 in review", for the page header. */
export function listingsSummary(listings: HostListing[]): string {
  if (listings.length === 0) return "Nothing here yet";
  const count = (status: ListingStatus) => listings.filter((l) => l.status === status).length;
  return `${listings.length} ${listings.length === 1 ? "listing" : "listings"} · ${count("Live")} live · ${count("In review")} in review`;
}

/** The row menu: the same list for every listing, but a hidden one offers to show it again. */
export function rowActions(listing: HostListing): { action: ListingRowAction; label: string; danger: boolean }[] {
  const list: [ListingRowAction, string][] = [
    ["edit", "Edit"],
    ["duplicate", "Duplicate"],
    ["preview", "Preview as a guest"],
    ["copy-link", "Copy the link"],
    listing.status === "Hidden" ? ["show", "Show in search"] : ["hide", "Hide from search"],
    ["pause", "Pause new bookings"],
    ["archive", "Archive"],
    ["delete", "Delete"],
  ];
  return list.map(([action, label]) => ({ action, label, danger: action === "delete" }));
}

export const priceLabel = formatNaira;
