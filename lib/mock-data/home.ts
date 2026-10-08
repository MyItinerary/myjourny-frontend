import type { ExperienceCardProps } from "@/components/experiences/experience-card";

// Card shape shared by every experience listing.
export type ExperienceItem = ExperienceCardProps & { id: string };

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

export type City = { id: string; name: string; country: string; imageSrc: string };

export const cities: City[] = [
  { id: "lagos", name: "Lagos", country: "Nigeria", imageSrc: "/images/home/cities/lagos.jpg" },
  { id: "abuja", name: "Abuja", country: "Nigeria", imageSrc: "/images/home/cities/abuja.jpg" },
  { id: "port-harcourt", name: "Port Harcourt", country: "Nigeria", imageSrc: "/images/home/cities/ibadan.jpg" },
  { id: "ibadan", name: "Ibadan", country: "Nigeria", imageSrc: "/images/home/cities/ibadan.jpg" },
  { id: "abeokuta", name: "Abeokuta", country: "Nigeria", imageSrc: "/images/home/cities/abeokuta.jpg" },
  { id: "jos", name: "Jos", country: "Nigeria", imageSrc: "/images/home/cities/jos.jpg" },
  { id: "bauchi", name: "Bauchi", country: "Nigeria", imageSrc: "/images/home/cities/bauchi.jpg" },
  { id: "kaduna", name: "Kaduna", country: "Nigeria", imageSrc: "/images/home/cities/kaduna.jpg" },
  { id: "calabar", name: "Calabar", country: "Nigeria", imageSrc: "/images/home/cities/calabar.jpg" },
  // Extra cities behind the "See more" expand (both cities sections show the
  // link in Figma, meaning more exist beyond the visible grid). Photos are
  // reused from the first 8 — same lorem-content convention as experiences.
  { id: "enugu", name: "Enugu", country: "Nigeria", imageSrc: "/images/home/cities/jos.jpg" },
  { id: "benin-city", name: "Benin City", country: "Nigeria", imageSrc: "/images/home/cities/ibadan.jpg" },
  { id: "kano", name: "Kano", country: "Nigeria", imageSrc: "/images/home/cities/abuja.jpg" },
  { id: "owerri", name: "Owerri", country: "Nigeria", imageSrc: "/images/home/cities/calabar.jpg" },
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
    description: "For its relentless energy",
  },
  {
    id: "abuja",
    city: "Abuja, Nigeria",
    description: "For its elegance, green, calm.",
  },
  {
    id: "port-harcourt",
    city: "Port Harcourt, Nigeria",
    description: "For its rich culture, endless flavor",
  },
  {
    id: "ibadan",
    city: "Ibadan, Nigeria",
    description: "For its rich Nigerian history",
  },
  {
    id: "calabar",
    city: "Calabar, Nigeria",
    description: "For its tourism",
  },
];

