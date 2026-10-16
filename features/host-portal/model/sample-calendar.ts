import { addDays } from "./calendar";
import type { CalendarEvent } from "./calendar.types";

// What the design draws: a walk, a sold-out boat morning, then the same again a
// week on. Placed relative to today so the preview always has upcoming dates.
// Used only for the `?preview=full` view while itin has no host API.
export function sampleCalendar(today: string): { events: CalendarEvent[]; blocked: string[] } {
  const on = (days: number) => addDays(today, days);
  return {
    events: [
      { id: "e1", date: on(1), title: "Photowalk 16:00", note: "6 of 8 guests", kind: "booked", guests: 6 },
      { id: "e2", date: on(2), title: "Boat morning", note: "5 of 5, sold out", kind: "sold-out", guests: 5 },
      { id: "e3", date: on(7), title: "Photowalk 16:00", note: "3 of 8 guests", kind: "booked", guests: 3 },
      { id: "e4", date: on(8), title: "Portraits 09:00", note: null, kind: "booked", guests: 5 },
    ],
    blocked: [on(11), on(12)],
  };
}
