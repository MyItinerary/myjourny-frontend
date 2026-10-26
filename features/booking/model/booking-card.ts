import type { PriceRule, PricingUnit, QuoteLine, QuoteSaving } from "./booking.types";
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

/** A price people pay: "Free" when it is nothing. Not for discounts, fees or refunds. */
export const shortPriceOrFree = (amount: number, currency: string) => (amount === 0 ? "Free" : shortPrice(amount, currency));

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

/** At five spots or fewer, name the slot; the last spot reads heavier. */
export function urgencyFor(seatsLeft: number | null, timeLabel: string, dayLabel: string) {
  if (seatsLeft === null || seatsLeft > 5 || seatsLeft < 1) return null;
  return seatsLeft === 1
    ? { level: "one" as const, text: `Last spot at ${timeLabel} on ${dayLabel}` }
    : { level: "few" as const, text: `${seatsLeft} spots left at ${timeLabel} on ${dayLabel}` };
}

export type DayState = "open" | "few" | "soldout" | "off";

export type BreakdownRow = { key: string; label: string; amount: string };

/** The few rows above the total: each ticket and add-on once there are add-ons, then a "Group saving" or
 * "Promo saving" row. An early-bird price is shown struck through in the headline, so it has no row, and
 * a plain booking with nothing extra has none at all: the total says it. */
export function breakdownRows(lines: QuoteLine[], savings: QuoteSaving[] | undefined, currency: string): BreakdownRow[] {
  const priced = lines.filter((line) => line.kind === "ticket" || line.kind === "addon");
  const withAddons = lines.some((line) => line.kind === "addon");
  const items = withAddons
    ? priced.map((line, i) => ({
        key: `${line.kind}-${i}`,
        label: line.label + (line.quantity > 1 ? ` × ${line.quantity}` : ""),
        amount: shortPriceOrFree(Number(line.amount), currency),
      }))
    : [];
  const saved = (savings ?? [])
    .filter((saving) => saving.kind !== "early_bird")
    .map((saving, i) => ({
      key: `saving-${i}`,
      label: saving.kind === "group" ? "Group saving" : "Promo saving",
      amount: shortPrice(Number(saving.amount), currency),
    }));
  // Older servers don't list savings; their discount lines say it.
  const older =
    savings === undefined
      ? lines
          .filter((line) => line.kind === "discount")
          .map((line, i) => ({ key: `discount-${i}`, label: "Discount", amount: shortPrice(Math.abs(Number(line.amount)), currency) }))
      : [];
  return [...items, ...saved, ...older];
}

/** With a group discount alone on one ticket type, the per-person price after it, the list price to strike through,
 * and the pill that says why: "Group of 4+". Null otherwise. */
export function groupHeadline(
  lines: QuoteLine[],
  savings: QuoteSaving[] | undefined,
  rules: PriceRule[],
  currency: string,
): { amount: string; was: string; pill: string } | null {
  const tickets = lines.filter((line) => line.kind === "ticket");
  const kinds = (savings ?? []).map((saving) => saving.kind);
  const group = (savings ?? []).find((saving) => saving.kind === "group");
  if (tickets.length !== 1 || !group || kinds.some((kind) => kind !== "group") || tickets[0].quantity < 1) return null;
  const [ticket] = tickets;
  const min = rules.find((rule) => rule.kind === "group")?.min_guests;
  return {
    amount: shortPrice((Number(ticket.amount) - Number(group.amount)) / ticket.quantity, currency),
    was: shortPrice(Number(ticket.unit_amount), currency),
    pill: min ? `Group of ${min}+` : "Group discount",
  };
}
