import { useMemo } from "react";

import type { ExperienceCardProps } from "@/components/experiences/experience-card";
import { useDiscoverCitiesViewModel, type DiscoverCitiesViewModel } from "@/features/cities";
import { useHomeHeroViewModel, type HomeHeroViewModel } from "@/features/home";
import { useLastSearchArea } from "@/features/search";
import { useTasteQuizAudience } from "@/features/taste-quiz-cta";
import { useSession } from "@/lib/auth/session-store";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { guestCategories, type Category as DefaultCategory } from "@/lib/mock-data/home";
import { useInterestCategories, type Category } from "@/lib/queries/categories";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  useBrowsingHistory,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";

import { nextSaturday } from "../model/weekend";

export type DiscoveryRail = {
  items: ExperienceCardProps[];
  isLoading: boolean;
  /** False once loaded with nothing to show: the section is left out. */
  show: boolean;
};

/** `iconSrc` is only set for the categories the design gives an icon (the rest show a plain dot). */
export type CategoryPill = { id: string; label: string; iconSrc?: string };

const CATEGORY_ICONS: Record<string, string> = { "local-food-drinks": "/images/discovery/local-food-drinks.png" };

function toCategoryPill(id: string, label: string): CategoryPill {
  return { id, label, iconSrc: CATEGORY_ICONS[id] };
}

/** The top-level interest categories as pills. While the API has none (loading, failed or empty) the
 * design's default categories stand in, so the section is always there. */
export function toCategoryPills(
  categories: Category[] | undefined,
  fallback: DefaultCategory[] = guestCategories,
): CategoryPill[] {
  const parents = (categories ?? []).filter((c) => c.parent_id === null);
  return parents.length > 0
    ? parents.map((c) => toCategoryPill(c.slug, c.text))
    : fallback.map((c) => toCategoryPill(c.id, c.label));
}

export type ExperiencesPageViewModel = {
  hero: HomeHeroViewModel;
  /** Signed-in users only. */
  pickUp: DiscoveryRail;
  /** "Based on your search in {area}": shows as soon as an area has been searched. */
  basedOnSearch: DiscoveryRail & { area: string | null };
  availableThisWeekend: DiscoveryRail;
  pickedForYou: DiscoveryRail;
  nearYouInLagos: DiscoveryRail;
  categories: CategoryPill[];
  cities: DiscoverCitiesViewModel;
};

const RAIL_SIZE = 10;
const NEAR_CITY = "Lagos";

function rail(items: ExperienceCardProps[], isLoading: boolean): DiscoveryRail {
  return { items, isLoading, show: isLoading || items.length > 0 };
}

/** The /experiences page: the home page's data sources, sliced the way the design lays them out.
 * TODO(backend): "Dive deeper into {subcategory}" needs a category-filtered listing, so it is left out. */
export function useExperiencesPageViewModel(): ExperiencesPageViewModel {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";
  const coords = {
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
  };
  const accountReady = isAccount && geolocation !== "pending";
  // "Picked for your taste" is built from the quiz, so it only shows once the quiz is done.
  const quizDone = useTasteQuizAudience() === "taken";

  const weekend = useMemo(() => nextSaturday(), []);

  const historyQuery = useBrowsingHistory(RAIL_SIZE);
  const picksQuery = useRecommendedExperiences({ ...coords, offset: 0, limit: RAIL_SIZE, enabled: accountReady && quizDone });
  const weekendQuery = useFilteredExperiences({ date: weekend, sort: "rating_desc", limit: RAIL_SIZE, enabled: hydrated });
  const lagosQuery = useFilteredExperiences({ city: NEAR_CITY, sort: "rating_desc", limit: RAIL_SIZE, enabled: hydrated });
  const categoriesQuery = useInterestCategories();
  const searchedArea = useLastSearchArea();
  const searchQuery = useFilteredExperiences({
    search: searchedArea ?? undefined,
    limit: RAIL_SIZE,
    enabled: hydrated && searchedArea !== null,
  });

  const pickUp = isAccount
    ? rail((historyQuery.data ?? []).map(experienceMatchToCardProps), historyQuery.isFetching)
    : { items: [], isLoading: false, show: false };
  const pickedForYou = quizDone
    ? rail((picksQuery.data ?? []).map(experienceMatchToCardProps), geolocation === "pending" || picksQuery.isFetching)
    : { items: [], isLoading: false, show: false };

  const basedOnSearch =
    searchedArea === null
      ? { items: [], isLoading: false, show: false, area: null }
      : { ...rail((searchQuery.data?.items ?? []).map(experienceListItemToCardProps), searchQuery.isPending), area: searchedArea };

  return {
    hero: useHomeHeroViewModel(),
    pickUp,
    basedOnSearch,
    availableThisWeekend: rail((weekendQuery.data?.items ?? []).map(experienceListItemToCardProps), weekendQuery.isPending),
    pickedForYou,
    nearYouInLagos: rail((lagosQuery.data?.items ?? []).map(experienceListItemToCardProps), lagosQuery.isPending),
    categories: toCategoryPills(categoriesQuery.data),
    cities: useDiscoverCitiesViewModel(),
  };
}
