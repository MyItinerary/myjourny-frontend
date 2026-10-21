import { COMMISSION_RATE } from "./earnings";
import { formatNaira } from "./money";
import type { DetailAction, DetailBannerKind, DetailTab, ListingDetail } from "./listing-detail.types";

export const DETAIL_TABS: DetailTab[] = ["About", "Reviews", "Rules and settings"];

export const RULE_LABELS = [
  "How people book",
  "Group size",
  "Length",
  "How often",
  "Youngest age",
  "How physical it is",
  "If the weather turns",
];

export const BANNER_TONE: Record<DetailBannerKind, "amber" | "grey" | "blue" | "red"> = {
  review: "amber",
  paused: "amber",
  archived: "grey",
  hidden: "grey",
  soldout: "blue",
  rejected: "red",
};

/** What one full group pays, what we keep, and what the host does. */
export function payout(detail: Pick<ListingDetail, "guests" | "price">) {
  const gross = detail.guests * detail.price;
  const commission = Math.round(gross * COMMISSION_RATE);
  return {
    line: `${detail.guests} guests at ${formatNaira(detail.price)}`,
    gross: formatNaira(gross),
    commission: formatNaira(commission),
    net: formatNaira(gross - commission),
    percent: Math.round(COMMISSION_RATE * 100),
  };
}

/** How full one date is. */
export function dateFill(taken: number, cap: number) {
  const full = taken === cap;
  return {
    full,
    percent: (taken / cap) * 100,
    seats: full ? `All ${cap} places taken` : taken === 0 ? `No bookings yet, ${cap} places free` : `${taken} of ${cap} booked`,
  };
}

export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const stars = (n: number) => "★".repeat(n);

/** Actions that take the host to another screen rather than change the listing. */
export const NAVIGATES: DetailAction[] = ["edit", "fix", "block-date", "add-dates", "past-bookings", "see-guests"];
