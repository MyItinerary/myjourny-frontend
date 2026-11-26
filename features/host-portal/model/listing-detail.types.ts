export type DetailAction =
  | "edit"
  | "fix"
  | "block-date"
  | "add-dates"
  | "pause"
  | "resume"
  | "copy-link"
  | "withdraw"
  | "duplicate"
  | "past-bookings"
  | "see-guests"
  | "show"
  | "archive"
  | "delete";

export type DetailBannerKind = "review" | "archived" | "soldout" | "hidden" | "paused" | "rejected";

export type ListingDetail = {
  id: string;
  hook: string;
  desc: string;
  inc: string[];
  exc: string[];
  /** "the yellow gate beside Freedom Park" */
  cue: string;
  area: string;
  /** A full group, for "what one full group pays you". */
  guests: number;
  price: number;
  payNote: string;
  cadence: string;
  stats: { label: string; value: string; note: string }[];
  dates: { date: string; when: string; taken: number; cap: number }[];
  noDates?: string;
  reviews: { name: string; stars: number; when: string; text: string }[];
  noReviews?: string;
  /** Seven values, one for each of RULE_LABELS. */
  rules: string[];
  actions: { label: string; action: DetailAction }[];
  banner?: { kind: DetailBannerKind; title: string; body: string; button: { label: string; action: DetailAction } };
};

export type DetailTab = "About" | "Reviews" | "Rules and settings";
