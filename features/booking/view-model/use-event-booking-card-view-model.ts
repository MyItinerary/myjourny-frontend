import { useState } from "react";

import type {
  BookingCardAction,
  BookingCardTotal,
  EventBookingData,
  EventTierMarker,
  EventTierStatus,
} from "../model/booking-card.types";
import { formatMoneyCompact } from "../model/format";

export type EventTierRow = {
  id: string;
  name: string;
  description: string | null;
  priceLabel: string;
  /** "₦20,000 per person" for tiers that seat a group. */
  perPersonLabel: string | null;
  status: EventTierStatus;
  marker: EventTierMarker | null;
  quantity: number;
  /** A tier with tickets picked gets the dark outline. */
  selected: boolean;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

/** Everything the event booking card shows. */
export type EventBookingCardProps = {
  date: { title: string; subtitle: string | null };
  tiers: EventTierRow[];
  total: BookingCardTotal;
  action: BookingCardAction;
};

/** What the customer picked, handed to the checkout. */
export type EventTicketSelection = {
  items: { tierId: string; quantity: number }[];
  /** The list-price total, until the backend quotes it. */
  total: number;
  currency: string;
};

type Options = {
  data: EventBookingData;
  /** Called when the customer taps the book button with tickets picked. */
  onBook: (selection: EventTicketSelection) => void;
  pending?: boolean;
};

/** Ticket quantities per tier and the total they come to. Tiers that are
 * sold out, ended or locked can't be picked. */
export function useEventBookingCardViewModel({ data, onBook, pending = false }: Options): EventBookingCardProps {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { currency } = data;
  const money = (amount: number) => formatMoneyCompact(amount, currency);

  const items = data.tiers
    .map((tier) => ({ tierId: tier.id, quantity: tier.status === "available" ? (quantities[tier.id] ?? 0) : 0 }))
    .filter((item) => item.quantity > 0);
  const total = data.tiers.reduce((sum, tier) => {
    const quantity = items.find((item) => item.tierId === tier.id)?.quantity ?? 0;
    return sum + tier.amount * quantity;
  }, 0);

  const setQuantity = (id: string, quantity: number) => setQuantities((q) => ({ ...q, [id]: quantity }));

  return {
    date: data.date,
    tiers: data.tiers.map((tier) => {
      const quantity = items.find((item) => item.tierId === tier.id)?.quantity ?? 0;
      const open = tier.status === "available";
      return {
        id: tier.id,
        name: tier.name,
        description: tier.description ?? null,
        priceLabel: money(tier.amount),
        perPersonLabel: tier.perPersonAmount != null ? `${money(tier.perPersonAmount)} per person` : null,
        status: tier.status,
        marker: tier.status === "sold_out" ? { tone: "strong", label: "Sold out" } : (tier.marker ?? null),
        quantity,
        selected: quantity > 0,
        canDecrease: open && quantity > 0,
        canIncrease: open && quantity < tier.maxQuantity,
        onDecrease: () => setQuantity(tier.id, Math.max(0, quantity - 1)),
        onIncrease: () => setQuantity(tier.id, Math.min(tier.maxQuantity, quantity + 1)),
      };
    }),
    total: {
      amount: items.length > 0 ? money(total) : null,
      hint: items.length > 0 ? null : "Select tickets",
      note: items.length > 0 ? "Fees and taxes included" : null,
    },
    action: {
      label: "Get tickets",
      disabled: items.length === 0 || pending,
      pending,
      onClick: () => onBook({ items, total, currency }),
    },
  };
}
