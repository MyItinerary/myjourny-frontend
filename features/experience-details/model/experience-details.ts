import type { ExperienceDetail } from "@/lib/queries/experiences";

import type { ExperienceDetailsContent, ExperienceFact } from "./experience-details.types";

const sentence = (value: string) => value.trim();

function groupSizeFact(min?: number | null, max?: number | null): ExperienceFact | null {
  if (!max) return null;
  const body = min && min > 1 ? `Up to ${max} guests, minimum ${min}` : `Up to ${max} guests`;
  return { id: "group", icon: "group", title: "Group size", body };
}

/** The "Before you book" facts the experience actually has. Nothing is made
 * up: a fact without data is left out. */
function buildFacts(experience: ExperienceDetail): ExperienceFact[] {
  const facts: (ExperienceFact | null)[] = [];
  const fitness = experience.requirements?.fitness;
  if (fitness) {
    facts.push({ id: "fitness", icon: "fitness", title: "Fitness level", body: sentence(fitness) });
  } else if (experience.energy_level) {
    facts.push({
      id: "fitness",
      icon: "fitness",
      title: "Fitness level",
      body: `${experience.energy_level[0].toUpperCase()}${experience.energy_level.slice(1)} energy`,
    });
  }
  const accessibility = experience.requirements?.accessibility ?? experience.safety_info?.mobilityAccessibility;
  if (accessibility) {
    facts.push({ id: "accessibility", icon: "accessibility", title: "Accessibility", body: sentence(accessibility) });
  }
  if (experience.requirements?.age) {
    facts.push({ id: "age", icon: "age", title: "Age", body: sentence(experience.requirements.age) });
  }
  facts.push(groupSizeFact(experience.group_size_min, experience.group_size_max));
  if (experience.cancellation_policy) {
    facts.push({
      id: "cancellation",
      icon: "cancellation",
      title: "Cancellation",
      body: sentence(experience.cancellation_policy),
    });
  }
  return facts.filter((fact): fact is ExperienceFact => fact !== null);
}

// Experience categories (the same slugs the home page's category pills use).
export const MORE_WAYS = [
  { id: "food", slug: "local-food-drinks", title: "Local food & drinks", subtitle: "Street eats, cafés, and hidden spots" },
  { id: "nature", slug: "nature-outdoors", title: "Nature & outdoors", subtitle: "Trails, water, and open air" },
  { id: "art", slug: "art-creativity", title: "Art & creativity", subtitle: "Studios, galleries, and workshops" },
  { id: "nightlife", slug: "nightlife", title: "Music & nightlife", subtitle: "Rooftops, live sets, late nights" },
];

const clean = (list?: string[] | null) => (list ?? []).map((item) => item.trim()).filter(Boolean);

/** Everything the experience page shows, from itin's experience. */
export function buildExperienceDetails(
  experience: ExperienceDetail,
  durationLabel: string,
): ExperienceDetailsContent {
  const location = [experience.city, experience.country].filter(Boolean).join(", ");
  const hostName = experience.host?.display_name?.trim() || "Your host";
  return {
    id: experience.id,
    title: experience.title,
    headline: experience.headline ?? null,
    durationLabel,
    rating: experience.rating ?? null,
    location,
    about: experience.description?.trim() || null,
    host: {
      id: experience.host?.id ?? null,
      name: hostName,
      verified: !!experience.host?.is_verified,
      blurb: experience.host?.headline?.trim() || "Your safety and satisfaction are well guaranteed",
    },
    place: {
      name: experience.city?.trim() || "Location",
      detail: location || experience.country || null,
    },
    facts: buildFacts(experience),
    itinerary: clean(experience.what_you_will_do),
    highlights: clean(experience.why_you_will_like_this),
    included: clean(experience.whats_included),
    notIncluded: clean(experience.whats_not_included),
    safetyNotes: clean(experience.safety_info?.notes),
    city: experience.city?.trim() || null,
    moreWays: MORE_WAYS,
    cancellationPolicy: experience.cancellation_policy?.trim() || null,
  };
}
