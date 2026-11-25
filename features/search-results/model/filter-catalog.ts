// HARDCODED FILTER CATALOGUE.
//
// Every option below is a placeholder until the backend exposes it. The
// endpoints this needs are listed in docs/search-filters-backend.md. When they
// exist, replace the exports here with query hooks that return the same shapes.
import { eventsEnabled } from "@/lib/feature-flags";
import type { ListingType } from "./search-results.types";

export interface CatalogOption {
  value: string;
  label: string;
  /** Zero matches in the current results: shown greyed and not tappable. */
  disabled?: boolean;
}

export interface CatalogCategory {
  slug: string;
  label: string;
  kind: ListingType;
}

const experience = (slug: string, label: string): CatalogCategory => ({ slug, label, kind: "experiences" });
const event = (slug: string, label: string): CatalogCategory => ({ slug, label, kind: "events" });

export const EXPERIENCE_CATEGORIES: CatalogCategory[] = [
  experience("local-food-drinks", "Local food & drinks"),
  experience("culture-history", "Culture & history"),
  experience("nature-outdoors", "Nature & outdoors"),
  experience("art-creativity", "Art & creativity"),
  experience("wellness-calm", "Wellness & calm"),
  experience("street-life", "Street life"),
  experience("events-live-shows", "Events & live shows"),
  experience("water-activity", "Water activity"),
  experience("fitness-movement", "Fitness & movement"),
  experience("games-social", "Games & social"),
  experience("fandom-subculture", "Fandom & subculture"),
  experience("faith-spirituality", "Faith & spirituality"),
  experience("books-ideas", "Books & ideas"),
  experience("fashion-style", "Fashion & style"),
];

export const EVENT_CATEGORIES: CatalogCategory[] = [
  event("music-live-shows", "Music & live shows"),
  event("parties-nightlife", "Parties & nightlife"),
  event("comedy-theatre", "Comedy & theatre"),
  event("food-drink-events", "Food & drink events"),
  event("arts-film-fashion", "Arts, film & fashion"),
  event("business-networking", "Business & networking"),
  event("learning-ideas", "Learning & ideas"),
  event("sports-fitness", "Sports & fitness"),
  event("faith-fellowship", "Faith & fellowship"),
  event("culture-community", "Culture & community"),
  event("fandom-games", "Fandom & games"),
  event("wellness-outdoors", "Wellness & outdoors"),
];

/** Experience and event categories mixed by popularity: the order the row shows them in. */
export const ROW_CATEGORIES: CatalogCategory[] = EXPERIENCE_CATEGORIES.flatMap((c, i) =>
  EVENT_CATEGORIES[i] ? [c, EVENT_CATEGORIES[i]] : [c],
);

export const ALL_CATEGORIES: CatalogCategory[] = [...EXPERIENCE_CATEGORIES, ...EVENT_CATEGORIES];

/** Subcategories people who took the taste quiz can filter by. */
export interface CatalogSubcategory {
  slug: string;
  label: string;
  parentSlug: string;
}

export const SUBCATEGORIES: CatalogSubcategory[] = [
  { slug: "street-food-markets", label: "Street food & markets", parentSlug: "local-food-drinks" },
  { slug: "bars-nightlife-drinks", label: "Bars & nightlife drinks", parentSlug: "local-food-drinks" },
  { slug: "cafes-coffee-culture", label: "Cafés & coffee culture", parentSlug: "local-food-drinks" },
  { slug: "museums-heritage-sites", label: "Museums & heritage sites", parentSlug: "culture-history" },
  { slug: "historic-neighborhoods", label: "Historic neighborhoods", parentSlug: "culture-history" },
  { slug: "local-traditions-festivals", label: "Local traditions & festivals", parentSlug: "culture-history" },
  { slug: "hiking-trails", label: "Hiking & trails", parentSlug: "nature-outdoors" },
  { slug: "beaches-waterfronts", label: "Beaches & waterfronts", parentSlug: "nature-outdoors" },
  { slug: "parks-green-spaces", label: "Parks & green spaces", parentSlug: "nature-outdoors" },
];

/** The categories this guest's taste profile puts first. */
export const FOR_YOU_CATEGORY_SLUGS = [
  "local-food-drinks",
  "music-live-shows",
  "culture-history",
  "parties-nightlife",
  "art-creativity",
];

export const TYPE_OPTIONS: { value: ListingType; label: string }[] = [
  { value: "experiences", label: "Experiences" },
  { value: "events", label: "Events" },
];

/** Events stay hidden until they launch: no Events type and no event categories. */
export function isTypeShown(type: ListingType): boolean {
  return type === "experiences" || eventsEnabled();
}

export const PRICE_QUICK_RANGES: { label: string; min: number | null; max: number | null }[] = [
  { label: "Under ₦5,000", min: null, max: 5_000 },
  { label: "₦5,000 to ₦15,000", min: 5_000, max: 15_000 },
  { label: "₦15,000 to ₦30,000", min: 15_000, max: 30_000 },
  { label: "₦30,000 to ₦50,000", min: 30_000, max: 50_000 },
  { label: "Over ₦50,000", min: 50_000, max: null },
];

export const TIME_OF_DAY_OPTIONS: CatalogOption[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "late_night", label: "Late night" },
];

export const DURATION_OPTIONS: (CatalogOption & { min: number | null; max: number | null })[] = [
  { value: "under_2h", label: "Under 2 hours", min: null, max: 120 },
  { value: "2_to_4h", label: "2 to 4 hours", min: 120, max: 240 },
  { value: "half_day", label: "Half day", min: 240, max: 360 },
  { value: "full_day", label: "Full day", min: 360, max: null },
];

export const LANGUAGE_OPTIONS: CatalogOption[] = [
  { value: "English", label: "English" },
  { value: "Yoruba", label: "Yoruba" },
  { value: "Pidgin", label: "Pidgin" },
  { value: "Igbo", label: "Igbo" },
  { value: "Hausa", label: "Hausa", disabled: true },
];

/** A group of chip options shown in the panel. `scope` says which type it belongs to. */
export interface ChipGroup {
  id: string;
  label: string;
  options: CatalogOption[];
  scope: "both" | ListingType;
}

export const COLLECTIONS: ChipGroup = {
  id: "collections",
  label: "Collections",
  scope: "both",
  options: [
    { value: "detty-december", label: "Detty December" },
    { value: "eid", label: "Eid", disabled: true },
    { value: "valentines", label: "Valentine's" },
    { value: "easter", label: "Easter" },
    { value: "independence-day", label: "Independence Day" },
  ],
};

export const PLACE_GROUPS: ChipGroup[] = [
  {
    id: "area",
    label: "Area",
    scope: "both",
    options: ["Lekki", "Victoria Island", "Ikoyi", "Lagos Island", "Surulere", "Yaba", "Ikeja", "Ajah"].map((v) => ({
      value: v,
      label: v,
    })),
  },
  {
    id: "setting",
    label: "Setting",
    scope: "both",
    options: [
      { value: "indoor", label: "Indoor" },
      { value: "outdoor", label: "Outdoor" },
    ],
  },
];

export const WHO_IT_SUITS_GROUPS: ChipGroup[] = [
  {
    id: "age",
    label: "Age",
    scope: "both",
    options: [
      { value: "all-ages", label: "All ages" },
      { value: "family-friendly", label: "Family friendly" },
      { value: "18+", label: "18+" },
      { value: "21+", label: "21+" },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    scope: "both",
    options: [
      { value: "step-free", label: "Step-free" },
      { value: "wheelchair", label: "Wheelchair accessible" },
    ],
  },
];

export const EXPERIENCE_GROUPS: ChipGroup[] = [
  {
    id: "booking",
    label: "Booking",
    scope: "experiences",
    options: [
      { value: "instant", label: "Instant book" },
      { value: "request", label: "Request to book" },
    ],
  },
  {
    id: "fitness",
    label: "Fitness level",
    scope: "experiences",
    options: [
      { value: "easy", label: "Easy" },
      { value: "moderate", label: "Moderate" },
      { value: "active", label: "Active" },
    ],
  },
  {
    id: "included",
    label: "What's included",
    scope: "experiences",
    options: ["Food", "Drinks", "Transport", "Equipment", "Photos"].map((v) => ({ value: v.toLowerCase(), label: v })),
  },
  {
    id: "style",
    label: "Style",
    scope: "experiences",
    options: [
      { value: "shared", label: "Shared group" },
      { value: "private", label: "Private group" },
      { value: "one-on-one", label: "One-on-one with the host" },
    ],
  },
];

export const EVENT_GROUPS: ChipGroup[] = [
  {
    id: "genre",
    label: "Genre",
    scope: "events",
    options: ["Afrobeats", "Amapiano", "Highlife", "Hip-hop", "R&B", "Gospel", "Jazz", "Reggae & dancehall", "Alté", "Fuji and Juju", "Live band"].map(
      (v) => ({ value: v.toLowerCase(), label: v }),
    ),
  },
  {
    id: "seating",
    label: "Seating",
    scope: "events",
    options: [
      { value: "seated", label: "Seated" },
      { value: "standing", label: "Standing" },
    ],
  },
];

/** Genre only shows on Events once one of these categories is selected. */
export const GENRE_CATEGORY_SLUGS = ["music-live-shows", "parties-nightlife"];

export interface FlagDef {
  id: string;
  label: string;
  scope: ListingType;
  /** On unless the guest turns it off. */
  defaultOn?: boolean;
}

export const EXPERIENCE_FLAGS: FlagDef[] = [
  { id: "freeCancellation", label: "Free cancellation", scope: "experiences" },
  { id: "verifiedHost", label: "Verified host", scope: "experiences" },
  { id: "hostReplies", label: "Host replies within 2 hours", scope: "experiences" },
  { id: "notWeatherDependent", label: "Not weather dependent", scope: "experiences" },
];

export const EVENT_FLAGS: FlagDef[] = [
  { id: "studentDiscount", label: "Student discount", scope: "events" },
  { id: "dressCode", label: "Dress code", scope: "events" },
  { id: "hideSoldOut", label: "Hide sold out", scope: "events", defaultOn: true },
  { id: "earlyBird", label: "Early bird on", scope: "events" },
  { id: "transfersAllowed", label: "Transfers allowed", scope: "events" },
];

export const ALL_FLAGS: FlagDef[] = [...EXPERIENCE_FLAGS, ...EVENT_FLAGS];
