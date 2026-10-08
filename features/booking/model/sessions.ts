import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ExperienceSessions } from "./booking.types";

/** "YYYY-MM-DD" for a calendar day in the browser's time zone. */
export function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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

/** "09:00:00" → "9:00 AM". */
export function formatSessionTime(localTime: string): string {
  const [h, m] = localTime.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/** Experiences without a schedule are booked by date and the host confirms
 * the time; midday stands in for it so the booking keeps its day. */
export function middayOf(key: string): string {
  const day = parseDateKey(key);
  day.setHours(12);
  return day.toISOString();
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
