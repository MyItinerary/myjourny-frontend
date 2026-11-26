/** A place the host picked. No pin when they typed it rather than picking it from the search. */
export type DraftLocation = { name: string; lat: number | null; lng: number | null };

export type WhenType = "once" | "recurring" | "request";
export type ListKey = "inc" | "exc" | "bring" | "wear" | "slots";
export type ToggleKey = "tags" | "days" | "diet" | "subs";
/** itin's values for fit and refunds. */
export type FitnessLevel = "easy" | "moderate" | "high" | "very_high" | "not_applicable";
export type AgePolicy = "all_ages" | "minimum_age" | "adult_required_under" | "adults_only";
export type Accessibility = "wheelchair_accessible" | "partly_accessible" | "not_suitable" | "not_confirmed";
export type RefundPolicy = "full_refund_until" | "non_refundable";
export type Choice<T extends string> = { key: T; label: string };

/** Everything a host fills in while building a listing. Numbers stay strings so empty inputs stay empty. */
export type ListingDraft = {
  title: string;
  hook: string;
  desc: string;
  /** Categories, by name. A host can pick more than one. */
  cats: string[];
  /** Subcategories, by name, under the categories picked. */
  subs: string[];
  tags: string[];
  city: string;
  area: string;
  /** Where it happens: landmarks, areas or towns. The first one on the map is its pin. */
  locations: DraftLocation[];
  cue: string;
  meetPhoto: string;
  whenType: WhenType | "";
  /** A one-off's date, YYYY-MM-DD. */
  date: string;
  days: string[];
  every: number;
  /** When a repeating schedule stops, YYYY-MM-DD; empty runs on. */
  until: string;
  slots: string[];
  dur: string;
  minG: string;
  maxG: string;
  price: string;
  priv: string;
  inc: string[];
  exc: string[];
  bring: string[];
  wear: string[];
  agePolicy: AgePolicy | "";
  ageMin: string;
  fitness: FitnessLevel | "";
  swim: string;
  diet: string[];
  access: Accessibility | "";
  /** Stairs, sand, how far the walk is. */
  accessNote: string;
  refund: RefundPolicy | "";
  /** Hours before the start a guest can still cancel for a full refund. */
  refundHours: string;
  weather: boolean;
  /** The host has ticked that they've read the safety rules and what they wrote is true. Asked again each time; itin doesn't keep it. */
  safetyAgreed: boolean;
  /** The host has ticked that they own the photos and the people in them agreed. Asked again each time; itin doesn't keep it. */
  photoRightsAgreed: boolean;
  photos: string[];
  cover: number;
  /** The host's one line to guests. */
  quote: string;
  /** The itin listing being edited, or null for a new one. */
  editingId: string | null;
};

/** The fields on the first step that have writing tips. */
export type BasicsField = "title" | "hook" | "desc";

export type BuilderStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type BuilderStep = {
  n: BuilderStepNumber;
  label: string;
  done: boolean;
  active: boolean;
  /** Review stays muted until every section is done. */
  locked: boolean;
  /** Can't be opened until the required steps before it are filled in. */
  blocked: boolean;
  /** What is still missing, for a section the guest has left unfinished. */
  attention: string | null;
  /** Small line under the label. */
  sub: string;
};

export type ChecklistItem = { step: BuilderStepNumber; label: string; ok: boolean };

/** A place search result, with its map pin. */
export type PlaceResult = {
  name: string;
  /** The line under the name in the list: street and neighbourhood. */
  area: string;
  lat: number;
  lng: number;
  /** The town or city it's in, when the map knows. Becomes the experience's city. */
  city?: string;
  /** Its neighbourhood, when the map knows. Becomes the experience's area. */
  district?: string;
};

export type PriceBreakdown = {
  line: string;
  gross: string;
  commission: string;
  net: string;
  perSeat: string;
};

export type BookingType = "instant" | "request";

export type CancelTier = { key: "Flexible" | "Moderate" | "Strict"; label: string; sub: string; hours: number | null };
