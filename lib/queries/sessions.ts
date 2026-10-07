"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/** A bookable session (itin GET /experiences/{id}/sessions). */
export type ExperienceSession = {
  /** UTC start; send it back unchanged as `requested_datetime`. */
  starts_at: string;
  /** Date and time where the experience runs ("2030-06-01", "09:00:00"). */
  local_date: string;
  local_time: string;
  /** null when the experience doesn't limit seats. */
  seats_left: number | null;
  sold_out: boolean;
};

export type ExperienceSessions = {
  timezone: string;
  /** false when admins set no schedule: any future time is accepted. */
  scheduled: boolean;
  sessions: ExperienceSession[];
};

import { dateKey, parseDateKey, formatSessionTime } from "@/lib/dates";
export { dateKey, parseDateKey, formatSessionTime };

/** Experiences without a schedule are booked by date and the host confirms
 * the time; midday stands in for it so the booking keeps its day. */
export function middayOf(key: string): string {
  const day = parseDateKey(key);
  day.setHours(12);
  return day.toISOString();
}

/** Bookable sessions for the next 90 days, from the admin's schedule. */
export function useExperienceSessions(experienceId: string) {
  return useQuery({
    queryKey: ["experiences", "sessions", experienceId],
    queryFn: async () => {
      const from = new Date();
      const to = new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);
      const { data } = await apiClient.get<ExperienceSessions>(
        `/experiences/${experienceId}/sessions`,
        { params: { from: dateKey(from), to: dateKey(to) } }
      );
      return data;
    },
    enabled: !!experienceId,
    // Seats change as people book.
    staleTime: 30_000,
  });
}
