import { useMemo, useState } from "react";

import type { ExperienceSession, ExperienceSessions } from "../model/booking.types";
import { dateFieldLabel, shortDay, urgencyFor, weekdayDay, type DayState } from "../model/booking-card";
import { addDaysToKey, dateKey, formatSessionTime, parseDateKey, todayIn } from "../model/sessions";

export type SessionOption = {
  startsAt: string;
  label: string;
  /** "Sold out" or "3 left", when worth saying. */
  note: string | null;
  disabled: boolean;
  selected: boolean;
};

export type SessionChoice = {
  /** The sessions are still loading. */
  loading: boolean;
  scheduled: boolean;
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
  /** The day has exactly one time and it's open: there is nothing to choose, so no time picker. */
  singleTime: boolean;
  /** "Sat 12 September", or "Fri 11 to Sun 13 September"; "Select a date" before one is chosen. */
  fieldLabel: string;
  /** Last day of a multi-day session, for the range in the calendar. */
  endDate: Date | null;
  /** How a day looks in the calendar: open, few spots left, sold out, or no times. */
  dayState: (date: Date) => DayState;
  /** Whether the chosen day has times to pick, is full, or has none. */
  dayStatus: "ok" | "soldout" | "empty";
  /** The next day with room after the chosen one, or null. */
  nextOpen: { label: string; shortLabel: string } | null;
  onJumpToNext: () => void;
  /** Few or one spot left for the chosen time. */
  urgency: { level: "few" | "one"; text: string } | null;
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
  loading = false,
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

  const nextOpenKey = selectedDay ? ([...byDate.keys()].sort().find((k) => k > selectedDay && hasOpenSession(k)) ?? null) : firstOpenDay;
  const fewLeft = (day: string) => (byDate.get(day) ?? []).some((s) => !s.sold_out && s.seats_left !== null && s.seats_left <= 5);
  const jumpTo = (key: string) => {
    setPickedDay(key);
    setPickedSessionAt(null);
  };

  return {
    loading,
    scheduled,
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
    // Sold-out days can be picked, so the card can say so and point forward.
    isDateSelectable: (date) => (scheduled ? byDate.has(dateKey(date)) : dateKey(date) >= tomorrow),
    onSelectDate: (date) => {
      setPickedDay(dateKey(date));
      setPickedSessionAt(null);
    },
    onPickSession: setPickedSessionAt,
    singleTime: daySessions.length === 1 && !daySessions[0].sold_out,
    fieldLabel: selectedDay ? dateFieldLabel(selectedDay, session?.end_local_date) : "Select a date",
    endDate: session?.end_local_date && session.end_local_date !== selectedDay ? parseDateKey(session.end_local_date) : null,
    dayState: (date) => {
      const key = dateKey(date);
      if (!scheduled) return key >= tomorrow ? "open" : "off";
      if (!byDate.has(key)) return "off";
      if (!hasOpenSession(key)) return "soldout";
      return fewLeft(key) ? "few" : "open";
    },
    dayStatus: !scheduled ? "ok" : daySessions.length === 0 ? "empty" : daySessions.every((s) => s.sold_out) ? "soldout" : "ok",
    nextOpen: nextOpenKey ? { label: weekdayDay(nextOpenKey), shortLabel: shortDay(nextOpenKey) } : null,
    onJumpToNext: () => nextOpenKey && jumpTo(nextOpenKey),
    urgency: session
      ? urgencyFor(session.seats_left, formatSessionTime(session.local_time), weekdayDay(session.local_date))
      : null,
  };
}
