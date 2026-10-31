// Public API of the event-details feature. Other code imports only from here.
export { fetchEvent, useEventDetail } from "./model/event-details";
export type { EventDetail } from "./model/event-details.types";
export { SAMPLE_EVENT, SAMPLE_EVENT_ID } from "./model/sample-event";
export type { EventDetailsViewModel } from "./view-model/use-event-details-view-model";
export { useEventDetailsViewModel } from "./view-model/use-event-details-view-model";
export { EventDetailsView } from "./view/event-details-view";
