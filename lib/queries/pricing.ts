"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// itin serialises money as decimal strings ("12000.00"); convert before maths.
type Money = string | number;

export type PricingUnit = "per_person" | "per_booking" | "per_day";

export type TicketType = {
  id: string;
  label: string;
  description?: string | null;
  amount: Money;
  pricing_unit: PricingUnit;
};

export type ExperienceAddon = {
  id: string;
  label: string;
  description?: string | null;
  amount: Money;
  pricing_unit: "per_booking" | "per_person";
};

export type PriceRule = {
  id: string;
  kind: "early_bird" | "day_of_week" | "group";
  label?: string | null;
  experience_price_id?: string | null;
  unit_amount?: Money | null;
  percent_off?: Money | null;
  book_before?: string | null;
  days_of_week?: number[] | null;
  min_guests?: number | null;
};

// GET /experiences/{id}/pricing — matches itin's ExperiencePricingOut.
export type ExperiencePricing = {
  currency: string;
  prices: TicketType[];
  addons: ExperienceAddon[];
  rules: PriceRule[];
};

export function useExperiencePricing(experienceId: string) {
  return useQuery({
    queryKey: ["experiences", "pricing", experienceId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExperiencePricing>(
        `/experiences/${experienceId}/pricing`
      );
      return data;
    },
    enabled: !!experienceId,
  });
}

// What the customer picked — the body of POST /bookings/quote and, with the
// guide and idempotency key added, of POST /bookings/.
export type PricingSelection = {
  experience_id: string;
  items: { experience_price_id: string; quantity: number }[];
  addons: { addon_id: string; quantity: number }[];
  requested_datetime?: string;
  days?: number;
  promo_code?: string;
};

export type QuoteLine = {
  kind: "ticket" | "addon" | "discount" | "fee";
  label: string;
  quantity: number;
  unit_amount: Money;
  amount: Money;
};

// Matches itin's QuoteOut. `total` is what the customer is charged.
export type Quote = {
  currency: string;
  lines: QuoteLine[];
  subtotal: Money;
  discount: Money;
  checkout_fee: Money;
  total: Money;
  guests: number;
  days: number;
  promo_code?: string | null;
  promo_applied: boolean;
  promo_message?: string | null;
};

// POST /bookings/quote — the server prices the selection with the same
// engine that prices the booking, so the total shown is the total charged.
export function useBookingQuote(selection: PricingSelection | null) {
  return useQuery({
    queryKey: ["bookings", "quote", selection],
    queryFn: async () => {
      const { data } = await apiClient.post<Quote>("/bookings/quote", selection);
      return data;
    },
    enabled: !!selection && selection.items.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
