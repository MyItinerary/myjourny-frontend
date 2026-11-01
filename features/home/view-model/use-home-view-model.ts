import { useSession } from "@/lib/auth/session-store";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  useBrowsingHistory,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import type { ExperienceCardProps } from "@/components/experiences/experience-card";
import { useDiscoverCitiesViewModel, type DiscoverCitiesViewModel } from "@/features/cities";
import { useTasteQuizCtaViewModel, type TasteQuizCtaViewModel } from "@/features/taste-quiz-cta";

import {
  DUMMY_LOCAL_FOOD_AND_DRINKS,
  DUMMY_POPULAR_EVENTS,
  DUMMY_UNFORGETTABLE_TRAVEL,
} from "../model/home-dummy-rails";
import { useHomeHeroViewModel, type HomeHeroViewModel } from "./use-home-hero-view-model";

export type HomeRail = {
  items: ExperienceCardProps[];
  isLoading: boolean;
  /** False once loaded with nothing to show: the section is left out. */
  show: boolean;
};

export type HomeViewModel = {
  hero: HomeHeroViewModel;
  happeningNear: HomeRail;
  popularEvents: HomeRail;
  topPicks: HomeRail;
  exploreLagos: HomeRail;
  cultureAndHistory: HomeRail;
  localFoodAndDrinks: HomeRail;
  unforgettableTravel: HomeRail;
  /** Signed-in users only. */
  browsingHistory: HomeRail;
  tasteQuiz: TasteQuizCtaViewModel;
  cities: DiscoverCitiesViewModel;
};

const RAIL_SIZE = 10;
// "Explore Lagos intentionally": the design fixes the city for now.
const HOME_CITY = "Lagos";
const CULTURE_INTEREST = "culture-history";

function rail(items: ExperienceCardProps[], isLoading: boolean): HomeRail {
  return { items, isLoading, show: isLoading || items.length > 0 };
}

/** Everything the home page shows. Guests get rails from the public listing (they have no profile to
 * personalise against); signed-in accounts get recommendations and their browsing history. */
export function useHomeViewModel(): HomeViewModel {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;
  // Wait for the stored session so signed-in users don't fire guest queries.
  const isGuest = hydrated && !isAccount;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";
  const coords = {
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
  };
  // Recommendations wait for geolocation to settle (coordinates, or "unavailable").
  const accountReady = isAccount && geolocation !== "pending";

  const nearQuery = useRecommendedExperiences({ ...coords, offset: 0, limit: RAIL_SIZE, enabled: accountReady });
  const picksQuery = useRecommendedExperiences({ ...coords, offset: RAIL_SIZE, limit: RAIL_SIZE, enabled: accountReady });
  const historyQuery = useBrowsingHistory(RAIL_SIZE);
  const guestNearQuery = useFilteredExperiences({ sort: "rating_desc", limit: RAIL_SIZE, enabled: isGuest });
  const guestPicksQuery = useFilteredExperiences({ sort: "created_at_desc", limit: RAIL_SIZE, enabled: isGuest });
  // The same for everyone: they don't depend on a profile.
  const lagosQuery = useFilteredExperiences({ city: HOME_CITY, sort: "rating_desc", limit: RAIL_SIZE, enabled: hydrated });
  const cultureQuery = useFilteredExperiences({
    interest: CULTURE_INTEREST,
    sort: "rating_desc",
    limit: RAIL_SIZE,
    enabled: hydrated,
  });

  const happeningNear = isAccount
    ? rail((nearQuery.data ?? []).map(experienceMatchToCardProps), geolocation === "pending" || nearQuery.isFetching)
    : rail((guestNearQuery.data?.items ?? []).map(experienceListItemToCardProps), guestNearQuery.isPending);
  const topPicks = isAccount
    ? rail((picksQuery.data ?? []).map(experienceMatchToCardProps), geolocation === "pending" || picksQuery.isFetching)
    : rail((guestPicksQuery.data?.items ?? []).map(experienceListItemToCardProps), guestPicksQuery.isPending);
  const browsingHistory = isAccount
    ? rail((historyQuery.data ?? []).map(experienceMatchToCardProps), historyQuery.isFetching)
    : { items: [], isLoading: false, show: false };

  return {
    hero: useHomeHeroViewModel(),
    happeningNear,
    popularEvents: rail(DUMMY_POPULAR_EVENTS, false),
    topPicks,
    exploreLagos: rail((lagosQuery.data?.items ?? []).map(experienceListItemToCardProps), lagosQuery.isPending),
    cultureAndHistory: rail((cultureQuery.data?.items ?? []).map(experienceListItemToCardProps), cultureQuery.isPending),
    localFoodAndDrinks: rail(DUMMY_LOCAL_FOOD_AND_DRINKS, false),
    unforgettableTravel: rail(DUMMY_UNFORGETTABLE_TRAVEL, false),
    browsingHistory,
    tasteQuiz: useTasteQuizCtaViewModel(),
    cities: useDiscoverCitiesViewModel(),
  };
}
