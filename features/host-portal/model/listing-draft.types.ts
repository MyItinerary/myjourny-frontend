export type WhenType = "once" | "recurring" | "request";
export type ListKey = "inc" | "exc" | "bring" | "wear" | "slots";
export type ToggleKey = "tags" | "days" | "diet";
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
  cat: string;
  sub: string;
  tags: string[];
  city: string;
  area: string;
  landmark: string;
  cue: string;
  meetPhoto: string;
  /** The landmark's map pin, from the place search. */
  lat: number | null;
  lng: number | null;
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
  photos: string[];
  cover: number;
  /** The host's one line to guests. */
  quote: string;
  /** The itin listing being edited, or null for a new one. */
  editingId: string | null;
};

export type BuilderStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type BuilderStep = {
  n: BuilderStepNumber;
  label: string;
  done: boolean;
  active: boolean;
};

export type ChecklistItem = { step: BuilderStepNumber; label: string; ok: boolean };

/** A place search result, with its map pin. */
export type PlaceResult = { name: string; area: string; lat: number; lng: number };

export type PriceBreakdown = {
  line: string;
  gross: string;
  commission: string;
  net: string;
  perSeat: string;
};
