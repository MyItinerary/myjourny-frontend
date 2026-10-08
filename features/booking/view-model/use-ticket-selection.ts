import { useState } from "react";

import type { ExperiencePricing, PricingSelection, PricingUnit, TicketType } from "../model/booking.types";
import { describeRule, formatPrice, UNIT_SUFFIX } from "../model/format";

export type TicketRow = {
  id: string;
  label: string;
  /** "₦5,000.00 / person", shown when there are several ticket types. */
  priceLabel: string | null;
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
};

export type AddonRow = {
  id: string;
  label: string;
  priceLabel: string;
  checked: boolean;
  onToggle: (on: boolean) => void;
};

export type TicketSelection = {
  priceFrom: { amount: string; unit: string; showFrom: boolean };
  ruleNotes: string[];
  tickets: TicketRow[];
  addons: AddonRow[];
  days: { show: boolean; value: number; onChange: (days: number) => void };
  guests: number;
  minGuestsWarning: string | null;
  /** The ticket, add-on and day part of the quote request. */
  picked: Pick<PricingSelection, "items" | "addons" | "days">;
};

type Options = {
  pricing: ExperiencePricing | undefined;
  /** Ticket prices from the experience, used until the full pricing loads. */
  fallbackPrices: { id: string; label: string; amount: number | string }[];
  currency: string;
  minGuests: number;
  maxGuests: number;
  /** The schedule sets how many days a session lasts, so per-day tickets
   * cover that many and the customer doesn't choose. */
  daysFixed?: boolean;
};

/** Ticket quantities, add-ons and days. By default the cheapest ticket type
 * gets the minimum group size. */
export function useTicketSelection({
  pricing,
  fallbackPrices,
  currency,
  minGuests,
  maxGuests,
  daysFixed = false,
}: Options): TicketSelection {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState(1);

  const tickets: TicketType[] =
    pricing?.prices ?? fallbackPrices.map((p) => ({ ...p, pricing_unit: "per_person" as PricingUnit }));
  const addons = pricing?.addons ?? [];
  const cheapest = tickets.reduce<TicketType | null>(
    (min, t) => (!min || Number(t.amount) < Number(min.amount) ? t : min),
    null,
  );
  const quantityOf = (id: string) => quantities[id] ?? (id === cheapest?.id ? minGuests : 0);
  const guests = tickets.reduce((sum, t) => sum + quantityOf(t.id), 0);
  const needsDays = tickets.some((t) => t.pricing_unit === "per_day" && quantityOf(t.id) > 0);
  const several = tickets.length > 1;

  return {
    priceFrom: {
      amount: formatPrice(Number(cheapest?.amount ?? 0), currency),
      unit: UNIT_SUFFIX[cheapest?.pricing_unit ?? "per_person"],
      showFrom: several,
    },
    ruleNotes: (pricing?.rules ?? [])
      .map((rule) => describeRule(rule, currency))
      .filter((note): note is string => !!note),
    tickets: tickets.map((t) => ({
      id: t.id,
      label: several ? t.label : "Participants",
      priceLabel: several ? `${formatPrice(Number(t.amount), currency)} ${UNIT_SUFFIX[t.pricing_unit]}` : null,
      quantity: quantityOf(t.id),
      max: Math.max(0, maxGuests - guests + quantityOf(t.id)),
      onChange: (quantity) => setQuantities((q) => ({ ...q, [t.id]: quantity })),
    })),
    addons: addons.map((a) => ({
      id: a.id,
      label: a.label,
      priceLabel: `${formatPrice(Number(a.amount), currency)}${a.pricing_unit === "per_person" ? " / person" : ""}`,
      checked: !!selectedAddons[a.id],
      onToggle: (on) => setSelectedAddons((s) => ({ ...s, [a.id]: on })),
    })),
    days: { show: needsDays && !daysFixed, value: days, onChange: setDays },
    guests,
    minGuestsWarning: guests < minGuests ? `This experience needs at least ${minGuests} guests.` : null,
    picked: {
      items: tickets
        .map((t) => ({ experience_price_id: t.id, quantity: quantityOf(t.id) }))
        .filter((i) => i.quantity > 0),
      addons: addons.filter((a) => selectedAddons[a.id]).map((a) => ({ addon_id: a.id, quantity: 1 })),
      days: needsDays && !daysFixed ? days : undefined,
    },
  };
}
