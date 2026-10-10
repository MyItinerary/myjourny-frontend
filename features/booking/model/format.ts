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

// itin sends naive UTC timestamps (no "Z"); mark them UTC before parsing.
const parseUtc = (value: string) => new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(value) ? value : `${value}Z`);

type RuleContext = {
  /** Guests picked so far; the group note says how many more qualify. */
  guests?: number;
  /** Early-bird rules that ended before this aren't shown. */
  now?: Date;
};

/** A short, customer-facing description of a curator's pricing rule, or null
 * when there's nothing to show (incomplete rule, early-bird already over). */
export function describeRule(rule: PriceRule, currency: string, { guests, now }: RuleContext = {}): string | null {
  if (rule.kind === "group" && rule.min_guests && rule.percent_off) {
    const percent = Number(rule.percent_off);
    if (guests !== undefined && guests >= rule.min_guests) {
      // "Qualifies", not "applied": a bigger discount may be used instead.
      return `Your booking qualifies for ${percent}% off (${rule.min_guests}+ guests)`;
    }
    const rest = guests !== undefined ? rule.min_guests - guests : 0;
    return (
      `${percent}% off for ${rule.min_guests}+ guests, any mix of tickets` +
      (rest > 0 && guests ? `. Add ${rest} more to qualify.` : "")
    );
  }
  if (rule.kind === "early_bird" && rule.book_before) {
    if (now && now >= parseUtc(rule.book_before)) return null;
    const until = new Date(rule.book_before).toLocaleDateString("en-US", { month: "long", day: "numeric" });
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

export const BEST_DISCOUNT_NOTE = "Discounts don't combine: you get the biggest one you qualify for.";

/** The notes shown under the price: one per rule that still applies, plus a
 * line saying only the biggest discount is used when several are on offer. */
export function describeRules(rules: PriceRule[], currency: string, context: RuleContext = {}): string[] {
  const shown = rules
    .map((rule) => ({ rule, note: describeRule(rule, currency, context) }))
    .filter((r): r is { rule: PriceRule; note: string } => !!r.note);
  const notes = shown.map((r) => r.note);
  const kinds = new Set(shown.map((r) => r.rule.kind));
  if (kinds.has("group") && kinds.has("early_bird")) {
    notes.push(BEST_DISCOUNT_NOTE);
  }
  return notes;
}

/** Log in, then come back to this experience. */
export function guestLoginHref(experienceId: string): string {
  return `/login?next=${encodeURIComponent(`/experiences/${experienceId}`)}`;
}

/**
 * When a session runs, in the zone it runs in: "Saturday, June 13 at 9:00 AM",
 * or for a session over several days "Sat, June 13 at 9:00 AM – Mon, June 15".
 */
export function formatSessionWhen(startsAt: string, endsAt?: string | null, timeZone = "Africa/Lagos"): string {
  const start = parseUtc(startsAt);
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(d);
  const end = endsAt ? parseUtc(endsAt) : null;
  if (end && day(end) !== day(start)) {
    const short = { timeZone, weekday: "short", month: "long", day: "numeric" } as const;
    const startText = new Intl.DateTimeFormat("en-US", { ...short, hour: "numeric", minute: "2-digit" }).format(start);
    return `${startText} – ${new Intl.DateTimeFormat("en-US", short).format(end)}`;
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
}

/** The parts of an experience's schedule a label needs. */
export type ScheduleSummary = {
  schedule_type?: string | null;
  recurrence_type?: string | null;
  recurrence_interval?: number | null;
  recurrence_days?: string[] | null;
  event_start_date?: string | null;
  event_end_date?: string | null;
  length_days?: number | null;
};

const DAY_NAMES: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const UNIT: Record<string, string> = { daily: "day", weekly: "week", monthly: "month", yearly: "year" };

/** "Every Saturday · 3 days", "Every 2 weeks on Fri, Sat", "One-off · 3 days".
 * Null when the experience has no schedule. */
export function scheduleLabel(s: ScheduleSummary): string | null {
  let length = Math.max(s.length_days ?? 1, 1);
  let pattern: string;
  if (s.schedule_type === "one_off") {
    pattern = "One-off";
    if (s.event_start_date && s.event_end_date) {
      const days = Math.round((Date.parse(s.event_end_date) - Date.parse(s.event_start_date)) / 86_400_000) + 1;
      length = Math.max(days, 1);
    }
  } else if (s.schedule_type === "recurring" && s.recurrence_type) {
    const interval = Math.max(s.recurrence_interval ?? 1, 1);
    const unit = UNIT[s.recurrence_type] ?? s.recurrence_type;
    const weekdays = s.recurrence_type === "weekly" ? (s.recurrence_days ?? []) : [];
    if (interval === 1 && weekdays.length === 1) pattern = `Every ${DAY_NAMES[weekdays[0]] ?? weekdays[0]}`;
    else {
      pattern = interval === 1 ? `Every ${unit}` : `Every ${interval} ${unit}s`;
      if (weekdays.length) pattern += ` on ${weekdays.map((d) => (DAY_NAMES[d] ?? d).slice(0, 3)).join(", ")}`;
    }
  } else {
    return null;
  }
  return length > 1 ? `${pattern} · ${length} days` : pattern;
}
