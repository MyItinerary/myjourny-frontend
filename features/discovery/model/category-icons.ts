// The icon each interest category and subcategory carries on the "Discover by
// categories" pills (Figma 2751:6482 for categories, 2751:5903 for subcategories).
const ICONS = "/images/discovery/categories";

const BY_SLUG: Record<string, string> = {
  // Categories
  "local-food-drinks": "street-food-markets",
  "culture-history": "building-08",
  "nature-outdoors": "parks-green-spaces",
  "art-creativity": "design-creative-spaces",
  "wellness-calm": "face-content",
  "street-life": "users-03",
  "events-live-shows": "music-note-01",
  // Subcategories
  "street-food-markets": "street-food-markets",
  "cafes-coffee-culture": "cafes-coffee-culture",
  "bars-nightlife-drinks": "bars-nightlife-drinks",
  "museums-heritage-sites": "building-08",
  "local-traditions-festivals": "local-traditions-festivals",
  "historic-neighborhoods-landmarks": "building-01",
  "hiking-trails": "hiking-trails",
  "beaches-waterfronts": "umbrella-03",
  "parks-green-spaces": "parks-green-spaces",
  "galleries-exhibitions": "image-01",
  "street-art-murals": "street-art-murals",
  "design-creative-spaces": "design-creative-spaces",
  "spas-massage": "face-content",
  "yoga-meditation": "yoga-meditation",
  "quiet-retreats-nature-escapes": "quiet-retreats-nature-escapes",
  "markets-vendors": "building-02",
  "neighborhood-walks": "neighborhood-walks",
  "local-hangout-spots": "users-03",
  "concerts-festivals": "music-note-01",
  "comedy-theatre": "comedy-theatre",
  "sports-watch-parties": "sports-watch-parties",
};

/** "Cafés & coffee culture" as "cafes-coffee-culture", the shape our category slugs take. */
export function slugOf(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The pill's icon, found by slug and, failing that, by its name. Undefined when the design has none. */
export function categoryIcon(slug: string, label: string): string | undefined {
  const name = BY_SLUG[slug] ?? BY_SLUG[slugOf(label)];
  return name ? `${ICONS}/${name}.svg` : undefined;
}

/** The design's subcategories under each category, for someone who has done the taste quiz while
 * the API has none. */
const DEFAULT_GROUPS: Record<string, string[]> = {
  "local-food-drinks": ["Street food & markets", "Cafés & coffee culture", "Bars & nightlife drinks", "Markets & vendors"],
  "culture-history": ["Museums & heritage sites", "Local traditions & festivals", "Historic neighborhoods & landmarks"],
  "nature-outdoors": ["Hiking & trails", "Beaches & waterfronts", "Parks & green spaces", "Quiet retreats & nature escapes"],
  "art-creativity": ["Galleries & exhibitions", "Street art & murals", "Design & creative spaces"],
  "wellness-calm": ["Spas & massage", "Yoga & meditation"],
  "street-life": ["Neighborhood walks", "Local hangout spots"],
  "events-live-shows": ["Concerts & festivals", "Comedy & theatre", "Sports & watch parties"],
};

export const DEFAULT_SUBCATEGORIES: { id: string; label: string; parent: string }[] = Object.entries(DEFAULT_GROUPS).flatMap(
  ([parent, labels]) => labels.map((label) => ({ id: slugOf(label), label, parent })),
);

/** The taste quiz's answers to "what are you into" (food, culture, …) as category slugs. */
const QUIZ_INTERESTS: Record<string, string> = {
  food: "local-food-drinks",
  culture: "culture-history",
  nature: "nature-outdoors",
  art: "art-creativity",
  wellness: "wellness-calm",
  "street-life": "street-life",
  events: "events-live-shows",
};

/** The categories someone picked in the quiz, as slugs. A slug saved as it is passes through. */
export function quizCategorySlugs(interests: string[] | null | undefined): string[] {
  return [...new Set((interests ?? []).map((i) => QUIZ_INTERESTS[i] ?? slugOf(i)))];
}
