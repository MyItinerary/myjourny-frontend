import type { ExperienceCardProps } from "@/components/experiences/experience-card";

// The Figma homepage reuses one lorem experience ("Kayaking in Victoria
// island...") everywhere — no backend/API exists yet, so this mirrors that
// with local fixtures instead of inventing distinct content.
export type ExperienceItem = ExperienceCardProps & { id: string };

const KAYAKING_IMAGE = "/images/home/experiences/kayaking.jpg";

function makeExperience(id: string, category: string): ExperienceItem {
  return {
    id,
    imageSrc: KAYAKING_IMAGE,
    imageAlt: "Kayaking in Victoria Island",
    category,
    title: "Kayaking in Victoria island, Paint and Sip & Two meals",
    duration: "1 hour",
    rating: 4.0,
    reviewCount: 1806,
    priceFrom: 10000,
  };
}

export const popularExperiences: ExperienceItem[] = [
  makeExperience("popular-1", "WATER ACTIVITY"),
  makeExperience("popular-2", "WATER ACTIVITY"),
  makeExperience("popular-3", "WATER ACTIVITY"),
  makeExperience("popular-4", "WATER ACTIVITY"),
  makeExperience("popular-5", "WATER ACTIVITY"),
  makeExperience("popular-6", "WATER ACTIVITY"),
];

export const browsingHistoryExperiences: ExperienceItem[] = [
  makeExperience("history-1", "WATER ACTIVITY"),
  makeExperience("history-2", "WATER ACTIVITY"),
  makeExperience("history-3", "WATER ACTIVITY"),
  makeExperience("history-4", "WATER ACTIVITY"),
];

export const topPicks: ExperienceItem[] = [
  makeExperience("top-pick-1", "BEACH"),
  makeExperience("top-pick-2", "BEACH"),
  makeExperience("top-pick-3", "BEACH"),
  makeExperience("top-pick-4", "BEACH"),
];

// Figma "Other experiences you might find interesting" — the category
// page's bottom rail (2001:12299 desktop / 2001:12478 mobile).
export const otherExperiences: ExperienceItem[] = [
  makeExperience("other-1", "BEACH"),
  makeExperience("other-2", "BEACH"),
  makeExperience("other-3", "BEACH"),
  makeExperience("other-4", "BEACH"),
];

export type Category = { id: string; label: string };

// Figma "Discover by categories" (2001:8436), guest variant — top-level
// categories. The design always shows a "See more" row even in the
// collapsed (VISIBLE_COUNT=7) state, meaning more than 7 exist — added an
// 8th so `hasMore` is true here too, matching the reference screenshot.
export const guestCategories: Category[] = [
  { id: "local-food-drinks", label: "Local food & drinks" },
  { id: "culture-history", label: "Culture & history" },
  { id: "nature-outdoors", label: "Nature & outdoors" },
  { id: "art-creativity", label: "Art & creativity" },
  { id: "wellness-calm", label: "Wellness & calm" },
  { id: "street-life", label: "Street life" },
  { id: "events-live-shows", label: "Events & live shows" },
  { id: "nightlife", label: "Nightlife" },
];

// Same component, `onboarded=true` variant (2001:8471) — subcategories
// tuned to the account instead of the generic top-level list.
export const accountCategories: Category[] = [
  { id: "street-food-markets", label: "Street food & markets" },
  { id: "cafes-coffee-culture", label: "Cafés & coffee culture" },
  { id: "bars-nightlife-drinks", label: "Bars & nightlife drinks" },
  { id: "museums-heritage-sites", label: "Museums & heritage sites" },
  { id: "local-traditions-festivals", label: "Local traditions & festivals" },
  { id: "historic-neighborhoods-landmarks", label: "Historic neighborhoods & landmarks" },
  { id: "hiking-trails", label: "Hiking & trails" },
  { id: "beaches-waterfronts", label: "Beaches & waterfronts" },
  { id: "parks-green-spaces", label: "Parks & green spaces" },
];

// Footer "More ways to experience your city" tabs — Figma only specs
// subcategory content for the first ("Local food & drinks") tab; the rest
// render the same placeholder row until that content exists.
export const inspirationCategories = guestCategories;

export const inspirationSubcategories = [
  { id: "street-food-markets", label: "Street food & markets" },
  { id: "cafes-coffee-culture", label: "Cafés & coffee culture" },
  { id: "bars-nightlife-drinks", label: "Bars & nightlife drinks" },
];

// Merged, deduped slug -> label lookup so /categories/[slug] works for a
// category from either list (guest top-level or account subcategories).
const allCategories = [...guestCategories, ...accountCategories];
export const categoriesBySlug = new Map(allCategories.map((c) => [c.id, c]));

export function getCategoryListing(slug: string): ExperienceItem[] | null {
  const category = categoriesBySlug.get(slug);
  if (!category) return null;
  return Array.from({ length: 20 }, (_, i) =>
    makeExperience(`${slug}-${i + 1}`, category.label.toUpperCase())
  );
}

export type City = { id: string; name: string; imageSrc: string };

export const cities: City[] = [
  { id: "lagos", name: "Lagos", imageSrc: "/images/home/cities/lagos.jpg" },
  { id: "abuja", name: "Abuja", imageSrc: "/images/home/cities/abuja.jpg" },
  { id: "ibadan", name: "Ibadan", imageSrc: "/images/home/cities/ibadan.jpg" },
  { id: "abeokuta", name: "Abeokuta", imageSrc: "/images/home/cities/abeokuta.jpg" },
  { id: "jos", name: "Jos", imageSrc: "/images/home/cities/jos.jpg" },
  { id: "bauchi", name: "Bauchi", imageSrc: "/images/home/cities/bauchi.jpg" },
  { id: "kaduna", name: "Kaduna", imageSrc: "/images/home/cities/kaduna.jpg" },
  { id: "calabar", name: "Calabar", imageSrc: "/images/home/cities/calabar.jpg" },
  // Extra cities behind the "See more" expand (both cities sections show the
  // link in Figma, meaning more exist beyond the visible grid). Photos are
  // reused from the first 8 — same lorem-content convention as experiences.
  { id: "enugu", name: "Enugu", imageSrc: "/images/home/cities/jos.jpg" },
  { id: "benin-city", name: "Benin City", imageSrc: "/images/home/cities/ibadan.jpg" },
  { id: "kano", name: "Kano", imageSrc: "/images/home/cities/abuja.jpg" },
  { id: "owerri", name: "Owerri", imageSrc: "/images/home/cities/calabar.jpg" },
];

export type Destination = {
  id: string;
  city: string;
  description: string;
};

export const suggestedDestinations: Destination[] = [
  {
    id: "lagos",
    city: "Lagos, Nigeria",
    description: "For it’s relentless energy",
  },
  {
    id: "abuja",
    city: "Abuja, Nigeria",
    description: "For it’s elegance, green, calm.",
  },
  {
    id: "port-harcourt",
    city: "Port Harcourt, Nigeria",
    description: "For it’s rich culture, endless flavor",
  },
  {
    id: "ibadan",
    city: "Ibadan, Nigeria",
    description: "For it’s rich Nigerian history",
  },
  {
    id: "calabar",
    city: "Calabar, Nigeria",
    description: "For it’s tourism",
  },
];

