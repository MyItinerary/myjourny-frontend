import type { CalendarCell, CalendarEvent } from "./calendar.types";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-09-19" */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, days: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

/** Monday of the week a date is in. */
export function weekStart(key: string): string {
  const date = parseKey(key);
  return addDays(key, -((date.getDay() + 6) % 7));
}

/** The month as weeks of seven squares, Monday first, blank before the 1st and after the last. */
export function monthCells(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = Array.from({ length: lead }, () => ({ date: null, day: null }));
  for (let day = 1; day <= days; day++) cells.push({ date: dateKey(new Date(year, month, day)), day });
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
  return cells;
}

/** The seven days of the week starting on `start`. */
export function weekCells(start: string): CalendarCell[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return { date, day: parseKey(date).getDate() };
  });
}

/** Every date from `a` to `b`, whichever is first. */
export function datesBetween(a: string, b: string): string[] {
  const [from, to] = a <= b ? [a, b] : [b, a];
  const out: string[] = [];
  for (let key = from; key <= to; key = addDays(key, 1)) out.push(key);
  return out;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKDAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Saturday 19 September" */
export function longDate(key: string): string {
  const d = parseKey(key);
  return `${WEEKDAY_LONG[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

/** "Sat 19 Sept" */
export function shortDate(key: string): string {
  const d = parseKey(key);
  const month = MONTH_NAMES[d.getMonth()];
  return `${WEEKDAY_LONG[d.getDay()].slice(0, 3)} ${d.getDate()} ${month === "September" ? "Sept" : month.slice(0, 3)}`;
}

/** "September 2026" */
export function monthTitle(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** "14 – 20 September 2026", or across a month "28 September – 4 October 2026". */
export function weekTitle(start: string): string {
  const a = parseKey(start);
  const b = parseKey(addDays(start, 6));
  const left = a.getMonth() === b.getMonth() ? `${a.getDate()}` : `${a.getDate()} ${MONTH_NAMES[a.getMonth()]}`;
  return `${left} – ${b.getDate()} ${MONTH_NAMES[b.getMonth()]} ${b.getFullYear()}`;
}

export type CalendarTotals = { datesWithGuests: number; guests: number; blocked: number };

/** "4 dates with guests · 19 guests expected · 2 blocked", from what's shown. */
export function totalsFor(events: CalendarEvent[], blocked: string[]): CalendarTotals {
  return {
    datesWithGuests: new Set(events.map((e) => e.date)).size,
    guests: events.reduce((sum, e) => sum + e.guests, 0),
    blocked: blocked.length,
  };
}

export function totalsLine({ datesWithGuests, guests, blocked }: CalendarTotals): string {
  const dates = `${datesWithGuests} ${datesWithGuests === 1 ? "date" : "dates"} with guests`;
  return `${dates} · ${guests} ${guests === 1 ? "guest" : "guests"} expected · ${blocked} blocked`;
}
