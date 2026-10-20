import type { PricingUnit } from "./booking.types";
import { parseDateKey } from "./sessions";

/** "₦16,000": whole naira without decimals, "₦16,000.50" when there are kobo. */
export function shortPrice(amount: number, currency: string): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

export const UNIT_WORDS: Record<PricingUnit, string> = {
  per_person: "per person",
  per_booking: "per group",
  per_day: "per person, per day",
};

const day = (key: string, month: "long" | "short" = "long") =>
  parseDateKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month });

/** "Sat 12 September", or "Fri 11 to Sun 13 September" over several days. */
export function dateFieldLabel(startKey: string, endKey?: string | null): string {
  if (!endKey || endKey === startKey) return day(startKey);
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const sameMonth = start.getMonth() === end.getMonth();
  const head = start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", ...(sameMonth ? {} : { month: "long" }) });
  return `${head} to ${day(endKey)}`;
}

/** "Sat 12 Sept", for the urgency line. */
export const weekdayDay = (key: string) => day(key, "short");

/** "12 Sept", for notices and the jump button. */
export const shortDay = (key: string) => parseDateKey(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** The cut-off for free cancellation: 24 hours before the session starts, in the zone it runs in. */
export function cancellationBody(startsAtUtc: string | null, timeZone: string | undefined, total: string | null): string {
  if (!startsAtUtc) return "Up to 24 hours before the start, for a full refund.";
  const iso = /(Z|[+-]\d\d:?\d\d)$/i.test(startsAtUtc) ? startsAtUtc : `${startsAtUtc}Z`;
  const cutoff = new Date(Date.parse(iso) - 24 * 3_600_000);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(cutoff)
      .map((p) => [p.type, p.value]),
  );
  const when = `${parts.weekday} ${parts.day} ${parts.month}, ${parts.hour}:${parts.minute}${String(parts.dayPeriod).toLowerCase()}`;
  return total ? `Until ${when}. After that ${total} is non-refundable.` : `Until ${when}.`;
}

/** At five spots or fewer, name the slot; the last spot reads heavier. */
export function urgencyFor(seatsLeft: number | null, timeLabel: string, dayLabel: string) {
  if (seatsLeft === null || seatsLeft > 5 || seatsLeft < 1) return null;
  return seatsLeft === 1
    ? { level: "one" as const, text: `Last spot at ${timeLabel} on ${dayLabel}` }
    : { level: "few" as const, text: `${seatsLeft} spots left at ${timeLabel} on ${dayLabel}` };
}

export type DayState = "open" | "few" | "soldout" | "off";
