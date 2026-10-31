import { eventCategoryLabel } from "../model/event-category";

export type EventCategoryViewModel = {
  label: string;
};

/** What the event category page needs: the category's name. Events are listed
 * here once the events API can filter by category. */
export function useEventCategoryViewModel(slug: string): EventCategoryViewModel {
  return { label: eventCategoryLabel(decodeURIComponent(slug)) };
}
