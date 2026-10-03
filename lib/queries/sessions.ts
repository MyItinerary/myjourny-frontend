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
