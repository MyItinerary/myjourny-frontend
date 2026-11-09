// What the experience page shows beyond what experience-details already
// works out (fit, itinerary, lists, location): the header, host, what's
// included and the category cards.

export type ExperiencePageContent = {
  id: string;
  title: string;
  headline: string | null;
  durationLabel: string;
  rating: number | null;
  /** "Tarkwa Bay, Lagos". */
  location: string;
  host: { id: string | null; name: string; verified: boolean; blurb: string };
  place: { name: string; detail: string | null };
  included: string[];
  notIncluded: string[];
  /** City, for "More ways to experience Lagos". Null when the experience has none. */
  city: string | null;
  /** Experience category cards: they open /categories/{slug}. */
  moreWays: { id: string; slug: string; title: string; subtitle: string }[];
};
