import type { CalendarEvent } from "./calendar.types";
import { sampleCalendar } from "./sample-calendar";

// itin doesn't serve a host their dates and bookings yet (its portal API is
// admin-only), so every host sees an empty calendar. Replace this with the real
// query once that API exists.
//
// While the design is reviewed, `?preview=full` fills it with the design's
// sample dates. That's off in production builds.
export function useHostCalendar(preview: string | null, today: string | null): { events: CalendarEvent[]; initialBlocked: string[] } {
  if (preview === "full" && process.env.NODE_ENV !== "production" && today) {
    const sample = sampleCalendar(today);
    return { events: sample.events, initialBlocked: sample.blocked };
  }
  return { events: [], initialBlocked: [] };
}
