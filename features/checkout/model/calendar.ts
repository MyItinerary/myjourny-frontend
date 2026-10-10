const pad = (n: number) => String(n).padStart(2, "0");

// 20260916T073000Z
const calendarStamp = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

/** A Google Calendar "new event" link for a booking. itin sends naive UTC
 * timestamps, so a missing zone is read as UTC. Null when there's no start. */
export function googleCalendarUrl({
  title,
  startsAt,
  durationMinutes,
}: {
  title: string;
  startsAt?: string | null;
  durationMinutes?: number | null;
}): string | null {
  if (!startsAt) return null;
  const start = new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(startsAt) ? startsAt : `${startsAt}Z`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + (durationMinutes && durationMinutes > 0 ? durationMinutes : 60) * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
