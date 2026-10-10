import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { suggestedDestinations } from "@/lib/mock-data/home";
import { FALLBACK_IMAGE } from "@/lib/queries/experiences";

import type {
  ActivitySuggestion,
  DestinationSuggestion,
  ExperienceSuggestion,
  SearchExperiencesParams,
} from "./search.types";

export { FALLBACK_IMAGE };

export const DEFAULT_DESTINATIONS: DestinationSuggestion[] = [
  ...suggestedDestinations,
  { id: "abeokuta", city: "Abeokuta, Nigeria", description: "For its iconic rocks and heritage" },
  { id: "jos", city: "Jos, Nigeria", description: "For its cool highlands and scenic plateaus" },
  { id: "bauchi", city: "Bauchi, Nigeria", description: "For wildlife safaris and natural beauty" },
  { id: "kaduna", city: "Kaduna, Nigeria", description: "For its rich trade crossroads" },
  { id: "enugu", city: "Enugu, Nigeria", description: "For the coal city hills and culture" },
  { id: "benin-city", city: "Benin City, Nigeria", description: "For royal arts and ancient history" },
  { id: "kano", city: "Kano, Nigeria", description: "For historic city walls and dyeing pits" },
  { id: "owerri", city: "Owerri, Nigeria", description: "For lively nightlife and hospitality" },
];

export const DEFAULT_ACTIVITIES: ActivitySuggestion[] = [
  { id: "local-food-drinks", label: "Local food & drinks", subtitle: "Street eats, cafés, and culinary tours" },
  { id: "street-food-markets", label: "Street food & markets", subtitle: "Local delicacies and bustling night markets" },
  { id: "cafes-coffee-culture", label: "Cafés & coffee culture", subtitle: "Artisan coffee, cozy spots, and pastry shops" },
  { id: "bars-nightlife-drinks", label: "Bars & nightlife drinks", subtitle: "Cocktail bars, speakeasies, and rooftop lounges" },
  { id: "nightlife", label: "Nightlife", subtitle: "Clubs, lounges, and late-night spots" },
  { id: "culture-history", label: "Culture & history", subtitle: "Museums, heritage, and local stories" },
  { id: "museums-heritage-sites", label: "Museums & heritage sites", subtitle: "Historical landmarks, art galleries, and monuments" },
  { id: "local-traditions-festivals", label: "Local traditions & festivals", subtitle: "Cultural celebrations and traditional ceremonies" },
  { id: "historic-neighborhoods-landmarks", label: "Historic neighborhoods", subtitle: "Iconic districts, architecture, and heritage walks" },
  { id: "nature-outdoors", label: "Nature & outdoors", subtitle: "Fresh air, trails, and open spaces" },
  { id: "hiking-trails", label: "Hiking & trails", subtitle: "Scenic routes and guided outdoor walks" },
  { id: "beaches-waterfronts", label: "Beaches & waterfronts", subtitle: "Boat cruises, beach days, and coastal fun" },
  { id: "parks-green-spaces", label: "Parks & green spaces", subtitle: "Botanical gardens, picnic spots, and urban parks" },
  { id: "art-creativity", label: "Art & creativity", subtitle: "Galleries, murals, and creative workshops" },
  { id: "wellness-calm", label: "Wellness & calm", subtitle: "Spas, quiet spots, and yoga sessions" },
  { id: "street-life", label: "Street life", subtitle: "Markets, corners, and everyday city buzz" },
  { id: "events-live-shows", label: "Events & live shows", subtitle: "Concerts, festivals, and live music" },
];

export function formatExperienceSubtitle(
  exp: Pick<ExperienceSuggestion, "city" | "price_from" | "currency" | "headline">,
): string {
  const cityPrefix = exp.city ? `${exp.city} · ` : "";
  if (exp.price_from != null) {
    const currency = exp.currency ?? "NGN";
    return `${cityPrefix}from ${currency} ${exp.price_from.toLocaleString()}`;
  }
  return exp.headline ? `${cityPrefix}${exp.headline}` : "Experience";
}

export const searchExperiencesQueryKey = (search?: string, limit?: number) =>
  ["experiences", "filter", { search: search?.trim().toLowerCase() ?? "", limit }] as const;

export function useSearchExperiences({
  search,
  limit = 5,
  enabled = true,
}: SearchExperiencesParams = {}) {
  const trimmed = search?.trim() ?? "";
  return useQuery({
    queryKey: searchExperiencesQueryKey(trimmed, limit),
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: ExperienceSuggestion[]; total: number }>(
        "/experiences/filter",
        {
          params: {
            search: trimmed,
            limit,
          },
        },
      );
      return data?.items ?? [];
    },
    enabled: enabled && trimmed.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
