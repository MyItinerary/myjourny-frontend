import type { ExperienceDetail } from "@/features/experience-details";

import type { ExperiencePageContent } from "./experience-page.types";

// HARD-CODED, NOT MERGEABLE AS-IS: the four "More ways to experience" cards (titles, subtitles and
// category slugs) are fixed here. TODO(backend/admin): serve them from the API and manage them on the
// admin dashboard. The slugs match the home page's category pills.
export const MORE_WAYS = [
  { id: "food", slug: "local-food-drinks", title: "Local food & drinks", subtitle: "Street eats, cafés, and hidden spots" },
  { id: "nature", slug: "nature-outdoors", title: "Nature & outdoors", subtitle: "Trails, water, and open air" },
  { id: "art", slug: "art-creativity", title: "Art & creativity", subtitle: "Studios, galleries, and workshops" },
  { id: "nightlife", slug: "nightlife", title: "Music & nightlife", subtitle: "Rooftops, live sets, late nights" },
];

const clean = (list?: string[] | null) => (list ?? []).map((item) => item.trim()).filter(Boolean);

/** The header, host, inclusions and category cards of the experience page. */
export function buildExperiencePage(experience: ExperienceDetail, durationLabel: string): ExperiencePageContent {
  const location = [experience.city, experience.country].filter(Boolean).join(", ");
  return {
    id: experience.id,
    title: experience.title,
    headline: experience.headline ?? null,
    durationLabel,
    rating: experience.rating ?? null,
    location,
    host: {
      id: experience.host?.id ?? null,
      name: experience.host?.display_name?.trim() || "Your host",
      verified: !!experience.host?.is_verified,
      // HARD-CODED fallback line. TODO(backend/admin): hosts need a short bio the admin can set.
      blurb: experience.host?.headline?.trim() || "Your safety and satisfaction are well guaranteed",
    },
    place: { name: experience.city?.trim() || "Location", detail: location || experience.country || null },
    included: clean(experience.whats_included),
    notIncluded: clean(experience.whats_not_included),
    city: experience.city?.trim() || null,
    moreWays: MORE_WAYS,
  };
}
