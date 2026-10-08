import type { PriceRule, PricingUnit } from "./booking.types";

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export const UNIT_SUFFIX: Record<PricingUnit, string> = {
  per_person: "/ person",
  per_booking: "/ group",
  per_day: "/ person / day",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A short, customer-facing description of a curator's pricing rule. */
export function describeRule(rule: PriceRule, currency: string): string | null {
  if (rule.kind === "group" && rule.min_guests && rule.percent_off) {
    return `${Number(rule.percent_off)}% off for ${rule.min_guests}+ guests`;
  }
  if (rule.kind === "early_bird" && rule.book_before) {
    const until = new Date(rule.book_before).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    return rule.unit_amount != null
      ? `Early-bird price ${formatPrice(Number(rule.unit_amount), currency)} when booked before ${until}`
      : `${Number(rule.percent_off)}% early-bird discount when booked before ${until}`;
  }
  if (rule.kind === "day_of_week" && rule.days_of_week?.length && rule.unit_amount != null) {
    const days = rule.days_of_week.map((d) => WEEKDAYS[d]).join(", ");
    return `${rule.label ?? "Special rate"}: ${formatPrice(Number(rule.unit_amount), currency)} on ${days}`;
  }
  return null;
}
