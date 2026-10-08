import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { dateKey, formatSessionTime, parseDateKey } from "@/lib/dates";

import type { ExperienceSessions } from "./booking.types";

// Calendar-day and clock helpers are shared app-wide (lib/dates); re-exported
// so the rest of this feature imports them from one place.
export { dateKey, formatSessionTime, parseDateKey };

/** Today's date ("YYYY-MM-DD") in an IANA time zone, e.g. the experience's. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(now);
}

/** A date key moved by whole days. */
export function addDaysToKey(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

/** "Africa/Lagos" → "Lagos", for "Times are Lagos time". */
export function zoneCity(timeZone: string): string {
  return (timeZone.split("/").pop() ?? timeZone).replace(/_/g, " ");
}

export const sessionsQueryKey = (experienceId: string) =>
  ["experiences", "sessions", experienceId] as const;

/** Bookable sessions for the next 90 days, from the admin's schedule. */
export function useExperienceSessions(experienceId: string) {
  return useQuery({
    queryKey: sessionsQueryKey(experienceId),
    queryFn: async () => {
      const from = new Date();
      const to = new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);
      const { data } = await apiClient.get<ExperienceSessions>(
        `/experiences/${experienceId}/sessions`,
        { params: { from: dateKey(from), to: dateKey(to) } },
      );
      return data;
    },
    enabled: !!experienceId,
    // Seats change as people book.
    staleTime: 30_000,
  });
}
