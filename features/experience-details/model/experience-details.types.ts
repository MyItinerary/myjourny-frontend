// What the new experience page shows. The page reads these shapes, built
// from itin's ExperienceDetail by `buildExperienceDetails`.

export type ExperienceFactIcon =
  | "fitness"
  | "accessibility"
  | "age"
  | "group"
  | "language"
  | "meeting"
  | "weather"
  | "cancellation";

/** One "Before you book" fact: fitness level, accessibility, age, group size. */
export type ExperienceFact = {
  id: string;
  icon: ExperienceFactIcon;
  title: string;
  body: string;
};

export type ExperienceDetailsContent = {
  id: string;
  title: string;
  headline: string | null;
  durationLabel: string;
  rating: number | null;
  /** "Tarkwa Bay, Lagos". */
  location: string;
  about: string | null;
  host: { id: string | null; name: string; verified: boolean; blurb: string };
  place: { name: string; detail: string | null };
  facts: ExperienceFact[];
  itinerary: string[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  safetyNotes: string[];
  /** City, for "More ways to experience Lagos". Null when the experience has none. */
  city: string | null;
  /** Experience category cards: they open /categories/{slug}. */
  moreWays: { id: string; slug: string; title: string; subtitle: string }[];
  /** Reads like "Free cancellation" copy, from the experience's own policy. */
  cancellationPolicy: string | null;
};

export type ExperienceReview = {
  id: string;
  initials: string;
  name: string;
  date: string;
  /** 1 to 5. */
  rating: number;
  text: string;
  verified: boolean;
  helpfulCount: number;
  hostReply?: { author: string; initials: string; text: string } | null;
  /** Avatar tint, from the reviews palette. */
  tone: "sand" | "blue" | "cream" | "amber";
};

export type ExperienceReviewsData = {
  average: number;
  count: number;
  breakdown: { label: string; value: number }[];
  summary: string | null;
  reviews: ExperienceReview[];
};
