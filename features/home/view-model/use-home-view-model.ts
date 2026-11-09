import { useSession } from "@/lib/auth/session-store";
import { eventsEnabled } from "@/lib/feature-flags";
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
import { useLastSearchArea } from "@/features/search";
import { useTasteQuizAudience, useTasteQuizCtaViewModel } from "@/features/taste-quiz-cta";

import {
  DUMMY_EARLY_BIRD,
  DUMMY_LOCAL_FOOD_AND_DRINKS,
  DUMMY_POPULAR_EVENTS,
  DUMMY_UNFORGETTABLE_TRAVEL,
} from "../model/home-dummy-rails";
import { useHomeHeroViewModel, type HomeHeroViewModel } from "./use-home-hero-view-model";
import { useTasteQuizPopupViewModel, type TasteQuizPopupViewModel } from "./use-taste-quiz-popup-view-model";

export type HomeRail = {
  items: ExperienceCardProps[];
  isLoading: boolean;
  /** False once loaded with nothing to show: the section is left out. */
  show: boolean;
};

export type HomeViewModel = {
  hero: HomeHeroViewModel;
  /** Signed-in users only. */
  pickUp: HomeRail;
  /** "Based on your search in {area}": shows as soon as an area has been searched. */
  basedOnSearch: HomeRail & { area: string | null };
  tonightAndThisWeekend: HomeRail;
  pickedForYou: HomeRail;
  localFoodAndDrinks: HomeRail;
  earlyBird: HomeRail;
  newOnMyJourny: HomeRail;
  unforgettableTravel: HomeRail;
  tasteQuizPopup: TasteQuizPopupViewModel;
  cities: DiscoverCitiesViewModel;
};

const RAIL_SIZE = 10;

function rail(items: ExperienceCardProps[], isLoading: boolean): HomeRail {
  return { items, isLoading, show: isLoading || items.length > 0 };
}

/** Everything the home page shows. Guests get the public rails; signed-in accounts also get their
 * browsing history, and recommendations ("Picked for your taste") once they have done the taste quiz. */
export function useHomeViewModel(): HomeViewModel {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";
  const coords = {
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
  };
  // Recommendations wait for geolocation to settle (coordinates, or "unavailable").
  const accountReady = isAccount && geolocation !== "pending";
  // "Picked for your taste" is built from the quiz, so it only shows once the quiz is done.
  const quizDone = useTasteQuizAudience() === "taken";

  const picksQuery = useRecommendedExperiences({ ...coords, offset: 0, limit: RAIL_SIZE, enabled: accountReady && quizDone });
  const historyQuery = useBrowsingHistory(RAIL_SIZE);
  const searchedArea = useLastSearchArea();
  const searchQuery = useFilteredExperiences({
    search: searchedArea ?? undefined,
    limit: RAIL_SIZE,
    enabled: hydrated && searchedArea !== null,
  });
  // The same for everyone: they don't depend on a profile.
  const newestQuery = useFilteredExperiences({ sort: "created_at_desc", limit: RAIL_SIZE, enabled: hydrated });

  const pickedForYou = quizDone
    ? rail((picksQuery.data ?? []).map(experienceMatchToCardProps), geolocation === "pending" || picksQuery.isFetching)
    : { items: [], isLoading: false, show: false };
  const pickUp = isAccount
    ? rail((historyQuery.data ?? []).map(experienceMatchToCardProps), historyQuery.isFetching)
    : { items: [], isLoading: false, show: false };

  const basedOnSearch =
    searchedArea === null
      ? { items: [], isLoading: false, show: false, area: null }
      : { ...rail((searchQuery.data?.items ?? []).map(experienceListItemToCardProps), searchQuery.isPending), area: searchedArea };

  return {
    hero: useHomeHeroViewModel(),
    pickUp,
    basedOnSearch,
    // See more goes to /events, which is a 404 while events are off.
    tonightAndThisWeekend: rail(eventsEnabled() ? DUMMY_POPULAR_EVENTS : [], false),
    pickedForYou,
    localFoodAndDrinks: rail(DUMMY_LOCAL_FOOD_AND_DRINKS, false),
    earlyBird: rail(DUMMY_EARLY_BIRD, false),
    newOnMyJourny: rail((newestQuery.data?.items ?? []).map(experienceListItemToCardProps), newestQuery.isPending),
    unforgettableTravel: rail(DUMMY_UNFORGETTABLE_TRAVEL, false),
    tasteQuizPopup: useTasteQuizPopupViewModel(useTasteQuizCtaViewModel()),
    cities: useDiscoverCitiesViewModel(),
  };
}
