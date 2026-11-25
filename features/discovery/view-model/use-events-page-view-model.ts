import { useHomeHeroViewModel, type HomeHeroViewModel } from "@/features/home";
import { useLastSearchArea } from "@/features/search";
import { accountCategories } from "@/lib/mock-data/home";
import { useTasteQuizAudience } from "@/features/taste-quiz-cta";
import { useInterestCategories } from "@/lib/queries/categories";

import {
  EARLY_BIRD_EVENTS,
  NEXT_WEEK_EVENTS,
  PICKED_FOR_YOU_EVENTS,
  POPULAR_EVENTS_TODAY,
  THIS_WEEKEND_EVENTS,
} from "../model/discovery-events";
import type { DiscoverEvent, PosterEvent } from "../model/discovery-events.types";
import { toCategoryPills, type CategoryPill } from "./use-experiences-page-view-model";

export type EventsPageViewModel = {
  hero: HomeHeroViewModel;
  popularToday: PosterEvent[];
  thisWeekend: DiscoverEvent[];
  earlyBird: DiscoverEvent[];
  /** "Based on your search in {area}": there as soon as an area has been searched, else null. */
  basedOnSearch: { area: string; events: DiscoverEvent[] } | null;
  /** Empty until the quiz is done: "Picked for your taste" is built from it. */
  pickedForYou: DiscoverEvent[];
  nextWeek: DiscoverEvent[];
  categories: CategoryPill[];
};

/** The /events page. Events have no API yet, so every rail is placeholder content (see
 * model/discovery-events.ts). TODO(backend): "Based on your search in {area}" should list events in
 * that area, and "Dive deeper into {subcategory}" is left out; both come with the events API. */
export function useEventsPageViewModel(): EventsPageViewModel {
  const categoriesQuery = useInterestCategories();
  const searchedArea = useLastSearchArea();
  const quizDone = useTasteQuizAudience() === "taken";

  return {
    hero: useHomeHeroViewModel(),
    popularToday: POPULAR_EVENTS_TODAY,
    thisWeekend: THIS_WEEKEND_EVENTS,
    earlyBird: EARLY_BIRD_EVENTS,
    basedOnSearch: searchedArea === null ? null : { area: searchedArea, events: THIS_WEEKEND_EVENTS },
    pickedForYou: quizDone ? PICKED_FOR_YOU_EVENTS : [],
    nextWeek: NEXT_WEEK_EVENTS,
    categories: toCategoryPills(categoriesQuery.data, accountCategories),
  };
}
