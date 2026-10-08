import { useMemo, useState } from "react";

import type { ExperienceSession, ExperienceSessions } from "../model/booking.types";
import { dateKey, formatSessionTime, middayOf, parseDateKey } from "../model/sessions";

export type SessionOption = {
  startsAt: string;
  label: string;
  /** "Sold out" or "3 left", when worth saying. */
  note: string | null;
  disabled: boolean;
  selected: boolean;
};

export type SessionChoice = {
  scheduled: boolean;
  /** Scheduled, but nothing is coming up. */
  noSessions: boolean;
  options: SessionOption[];
  session: ExperienceSession | null;
  /** What to send as requested_datetime; null until a time can be booked. */
  requestedDatetime: string | null;
  selectedDate: Date | null;
  dateLabel: string;
  minDate: Date;
  /** Whether a day can be picked (session days, or any future day). */
  isDateSelectable: (date: Date) => boolean;
  onSelectDate: (date: Date) => void;
  onPickSession: (startsAt: string) => void;
};

function tomorrowKey(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateKey(tomorrow);
}

/** Which day and session the customer is booking. Until they pick, the first
 * open session (or, without a schedule, the event date or tomorrow) is used. */
export function useSessionChoice(
  sessionData: ExperienceSessions | undefined,
  eventStartDate?: Date | null,
): SessionChoice {
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedSessionAt, setPickedSessionAt] = useState<string | null>(null);

  // Sessions come from the admin's schedule; the API rejects any other time.
  const scheduled = sessionData?.scheduled ?? false;
  const byDate = useMemo(() => {
    const map = new Map<string, ExperienceSession[]>();
    for (const s of sessionData?.sessions ?? []) {
      map.set(s.local_date, [...(map.get(s.local_date) ?? []), s]);
    }
    return map;
  }, [sessionData]);
  const hasOpenSession = (day: string) => (byDate.get(day) ?? []).some((s) => !s.sold_out);
  const firstOpenDay = [...byDate.keys()].find(hasOpenSession) ?? null;
  const eventDay = eventStartDate ? dateKey(eventStartDate) : null;
  const tomorrow = tomorrowKey();
  const selectedDay =
    pickedDay ?? (scheduled ? firstOpenDay : eventDay && eventDay > tomorrow ? eventDay : tomorrow);
  const daySessions = scheduled && selectedDay ? (byDate.get(selectedDay) ?? []) : [];
  const session =
    daySessions.find((s) => s.starts_at === pickedSessionAt && !s.sold_out) ??
    daySessions.find((s) => !s.sold_out) ??
    null;

  return {
    scheduled,
    noSessions: scheduled && byDate.size === 0,
    options: daySessions.map((s) => ({
      startsAt: s.starts_at,
      label: formatSessionTime(s.local_time),
      note: s.sold_out
        ? "Sold out"
        : s.seats_left !== null && s.seats_left <= 5
          ? `${s.seats_left} left`
          : null,
      disabled: s.sold_out,
      selected: session?.starts_at === s.starts_at,
    })),
    session,
    requestedDatetime: scheduled ? (session?.starts_at ?? null) : selectedDay ? middayOf(selectedDay) : null,
    selectedDate: selectedDay ? parseDateKey(selectedDay) : null,
    dateLabel: selectedDay
      ? parseDateKey(selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      : "Select dates",
    minDate: scheduled ? new Date() : parseDateKey(tomorrow),
    isDateSelectable: (date) =>
      scheduled ? hasOpenSession(dateKey(date)) : dateKey(date) >= tomorrow,
    onSelectDate: (date) => {
      setPickedDay(dateKey(date));
      setPickedSessionAt(null);
    },
    onPickSession: setPickedSessionAt,
  };
}
