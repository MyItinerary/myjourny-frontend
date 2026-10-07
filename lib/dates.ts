/**
 * Shared date and time formatting and parsing helpers.
 */

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const WEEKDAY_LABELS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

/**
 * Datetimes from /bookings/me are UTC without a timezone suffix (e.g. "2026-09-26T10:00:00").
 * Parse them strictly as UTC by appending "Z" if no timezone suffix is present.
 */
export function parseUtcDate(datetimeStr?: string | null): Date | null {
  if (!datetimeStr) return null;
  const hasTimezone = /[Zz]|[+-]\d{2}(:\d{2})?$/.test(datetimeStr);
  const iso = hasTimezone ? datetimeStr : `${datetimeStr}Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

/** Parses a "YYYY-MM-DD" key into a Date object. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "YYYY-MM-DD" for a calendar day in the browser's time zone. */
export function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Returns the ordinal suffix for a given day number ("st", "nd", "rd", "th"). */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

/** Formats a date into "Month Day[th], Year" (e.g. "September 26th, 2026"). */
export function formatBookingDates(
  datetimeStr?: string | null,
  fallback = "Date to be confirmed"
): string {
  if (!datetimeStr) return fallback;
  try {
    const d = parseUtcDate(datetimeStr);
    if (!d) return fallback;

    const month = MONTH_NAMES[d.getUTCMonth()];
    const day = d.getUTCDate();
    const year = d.getUTCFullYear();
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
  } catch {
    return fallback;
  }
}

/** Parses "HH:MM" or "HH:MM:SS" into hours and minutes numbers. */
export function parseTimeString(timeStr: string): { hour: number; minute: number } {
  const [h = 0, m = 0] = timeStr.split(":").map(Number);
  return { hour: h, minute: m };
}

/** "09:00:00" or "09:00" → "9:00 AM". */
export function formatSessionTime(localTime: string): string {
  const { hour: h, minute: m } = parseTimeString(localTime);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/** Formats a Date's time component to "9:00 AM" (optionally in UTC). */
export function formatTime(date: Date, utc = false): string {
  const h = utc ? date.getUTCHours() : date.getHours();
  const m = utc ? date.getUTCMinutes() : date.getMinutes();
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

/** Formats UTC time from an ISO datetime string to e.g. "9:00 AM". */
export function formatUtcTime(datetimeStr?: string | null): string | null {
  const d = parseUtcDate(datetimeStr);
  if (!d) return null;
  return formatTime(d, true);
}
