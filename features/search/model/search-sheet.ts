import { MONTH_NAMES } from "@/lib/dates";

import { startOfToday } from "./search";
import type { CalendarDay, CalendarMonth, DatePreset, TextSegment } from "./search-sheet.types";
import type { DateRange } from "./search.types";

/** Lagos areas the phone search sheet suggests (Figma 2726:7167 "Popular areas in Lagos"). Hardcoded until there's an areas endpoint. */
export const LAGOS_AREAS = ["Lekki", "Victoria Island", "Ikoyi", "Lagos Island", "Surulere", "Yaba", "Ikeja", "Ajah"] as const;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;

/** Splits `text` around the first case-insensitive occurrence of `query`. */
export function matchSegments(text: string, query: string): TextSegment[] {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, at), match: false },
    { text: text.slice(at, at + q.length), match: true },
    { text: text.slice(at + q.length), match: false },
  ].filter((segment) => segment.text);
}

export function matchesQuery(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !!q && text.toLowerCase().includes(q);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Tonight, This weekend (the coming Sat and Sun, or what's left of it), Next week (Mon to Sun) and Anytime. */
export function datePresets(now: Date = new Date()): DatePreset[] {
  const today = startOfToday(now);
  const weekday = today.getDay(); // 0 Sunday … 6 Saturday
  const weekendStart = weekday === 0 ? today : addDays(today, 6 - weekday);
  const weekendEnd = weekday === 0 ? today : addDays(weekendStart, 1);
  const nextMonday = addDays(today, ((8 - weekday) % 7) || 7);
  return [
    { id: "tonight", label: "Tonight", range: { start: today, end: today } },
    { id: "weekend", label: "This weekend", range: { start: weekendStart, end: weekendEnd } },
    { id: "next-week", label: "Next week", range: { start: nextMonday, end: addDays(nextMonday, 6) } },
    { id: "anytime", label: "Anytime", range: null },
  ];
}

const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();

/** The preset a picked range is, if any (Anytime never matches: it's no range at all). */
export function presetFor(range: DateRange, now: Date = new Date()): DatePreset | null {
  if (!range.start) return null;
  const end = range.end ?? range.start;
  return datePresets(now).find((p) => p.range && sameDay(p.range.start, range.start) && sameDay(p.range.end, end)) ?? null;
}

const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** What a collapsed When row and a recent search show for some dates: a preset's name, or the dates ("Sat 7 Nov"). */
export function describeDates(range: DateRange, now: Date = new Date()): string {
  const preset = presetFor(range, now);
  if (preset) return preset.label;
  if (!range.start) return "";
  if (!range.end || sameDay(range.start, range.end)) return DAY.format(range.start);
  return `${DAY.format(range.start)} – ${DAY.format(range.end)}`;
}

/** First tap starts a range, the second ends it; a tap before the start starts again. Past days can't be picked. */
export function pickRange(range: DateRange, day: Date, now: Date = new Date()): DateRange {
  if (day < startOfToday(now)) return range;
  if (!range.start || range.end) return { start: day, end: null };
  return day < range.start ? { start: day, end: null } : { start: range.start, end: day };
}

/** `count` months from this one, laid out Monday first, with the picked range marked. */
export function calendarMonths(range: DateRange, count = 12, now: Date = new Date()): CalendarMonth[] {
  const today = startOfToday(now);
  const start = range.start;
  const end = range.end && start && range.end > start ? range.end : null;
  return Array.from({ length: count }, (_, offset) => {
    const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i): CalendarDay => {
      const date = new Date(first.getFullYear(), first.getMonth(), i + 1);
      const isStart = sameDay(date, start);
      const isEnd = sameDay(date, end);
      const inside = !!start && !!end && date > start && date < end;
      return {
        date,
        day: i + 1,
        state: date < today ? "past" : sameDay(date, today) ? "today" : "default",
        selected: isStart || isEnd,
        band: end ? (isStart ? "start" : isEnd ? "end" : inside ? "middle" : "none") : "none",
      };
    });
    return {
      key: `${first.getFullYear()}-${first.getMonth()}`,
      label: `${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`,
      leadingBlanks: (first.getDay() + 6) % 7,
      days,
    };
  });
}

export function formatGuestCount(count: number): string {
  return `${count} guest${count === 1 ? "" : "s"}`;
}
