import { useMemo, useState } from "react";

import type { ExperienceSession, ExperienceSessions } from "../model/booking.types";
import { addDaysToKey, dateKey, formatSessionTime, parseDateKey, todayIn, zoneCity } from "../model/sessions";

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
  /** "Times are Lagos time.": session times are in the experience's zone. */
  timezoneNote: string;
  /** Scheduled, but nothing is coming up. */
  noSessions: boolean;
  /** Sessions are coming up, but every one is full. */
  allSoldOut: boolean;
  options: SessionOption[];
  session: ExperienceSession | null;
  /** The session to book: a start time (scheduled) or a local date
   * (unscheduled; the server picks noon in the experience's zone). Null
   * until something can be booked. */
  request: { requested_datetime: string } | { requested_date: string } | null;
  /** Days each session lasts (set by the schedule). */
  lengthDays: number;
  selectedDate: Date | null;
  dateLabel: string;
  minDate: Date;
  /** Whether a day can be picked (session days, or any future day). */
  isDateSelectable: (date: Date) => boolean;
  onSelectDate: (date: Date) => void;
  onPickSession: (startsAt: string) => void;
};

const monthDay = (key: string) => parseDateKey(key).toLocaleDateString("en-US", { month: "long", day: "numeric" });

/** "June 13", or "June 13 – June 15" for a session over several days. */
function dayRange(startKey: string, endKey?: string | null): string {
  return endKey && endKey !== startKey ? `${monthDay(startKey)} – ${monthDay(endKey)}` : monthDay(startKey);
}

/** Which day and session the customer is booking. Until they pick, the first
 * open session (or, without a schedule, the event date or tomorrow) is used.
 * "Today" is the experience's today, not the browser's: a customer abroad
 * sees the same bookable days as one in the experience's city. */
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
  const timeZone = sessionData?.timezone;
  const today = timeZone ? todayIn(timeZone) : dateKey(new Date());
  const tomorrow = addDaysToKey(today, 1);
  const selectedDay =
    pickedDay ?? (scheduled ? firstOpenDay : eventDay && eventDay > tomorrow ? eventDay : tomorrow);
  const daySessions = scheduled && selectedDay ? (byDate.get(selectedDay) ?? []) : [];
  const session =
    daySessions.find((s) => s.starts_at === pickedSessionAt && !s.sold_out) ??
    daySessions.find((s) => !s.sold_out) ??
    null;

  return {
    scheduled,
    timezoneNote: timeZone ? `Times are ${zoneCity(timeZone)} time.` : "Times are local to the experience.",
    noSessions: scheduled && byDate.size === 0,
    allSoldOut: scheduled && byDate.size > 0 && firstOpenDay === null,
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
    request: scheduled
      ? session
        ? { requested_datetime: session.starts_at }
        : null
      : selectedDay
        ? { requested_date: selectedDay }
        : null,
    lengthDays: Math.max(sessionData?.length_days ?? 1, 1),
    selectedDate: selectedDay ? parseDateKey(selectedDay) : null,
    dateLabel: selectedDay ? dayRange(selectedDay, session?.end_local_date) : "Select dates",
    minDate: parseDateKey(scheduled ? today : tomorrow),
    isDateSelectable: (date) =>
      scheduled ? hasOpenSession(dateKey(date)) : dateKey(date) >= tomorrow,
    onSelectDate: (date) => {
      setPickedDay(dateKey(date));
      setPickedSessionAt(null);
    },
    onPickSession: setPickedSessionAt,
  };
}
