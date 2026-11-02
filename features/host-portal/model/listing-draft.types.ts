export type WhenType = "once" | "recurring" | "request";
export type BookType = "instant" | "request";
export type ListKey = "inc" | "exc" | "bring" | "wear" | "slots";
export type ToggleKey = "tags" | "days" | "diet";

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
  whenType: WhenType | "";
  days: string[];
  every: number;
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
  ageMin: string;
  fitness: string;
  swim: string;
  diet: string[];
  access: string;
  weather: boolean;
  photos: string[];
  cover: number;
  quote: string;
  bookType: BookType | "";
};

export type BuilderStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type BuilderStep = {
  n: BuilderStepNumber;
  label: string;
  done: boolean;
  active: boolean;
};

export type ChecklistItem = { step: BuilderStepNumber; label: string; ok: boolean };

export type PlaceResult = { name: string; area: string };

export type PriceBreakdown = {
  line: string;
  gross: string;
  commission: string;
  net: string;
  perSeat: string;
};
