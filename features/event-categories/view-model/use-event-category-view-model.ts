import { eventCategoryLabel } from "../model/event-category";

export type EventCategoryViewModel = {
  label: string;
};

/** TODO(backend/admin): event categories are not defined anywhere yet, so this page only names
 * the category and shows an empty state. It needs event categories managed on the admin dashboard
 * and events filterable by category.
 *
 * What the event category page needs: the category's name. Events are listed
 * here once the events API can filter by category. */
export function useEventCategoryViewModel(slug: string): EventCategoryViewModel {
  return { label: eventCategoryLabel(decodeURIComponent(slug)) };
}
