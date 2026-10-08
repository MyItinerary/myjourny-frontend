// DTOs for booking an experience, matching itin's API.

// itin serialises money as decimal strings ("12000.00"); convert before maths.
export type Money = string | number;

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

/** GET /experiences/{id}/pricing (itin's ExperiencePricingOut). */
export type ExperiencePricing = {
  currency: string;
  prices: TicketType[];
  addons: ExperienceAddon[];
  rules: PriceRule[];
};

/** What the customer picked: the body of POST /bookings/quote and, with the
 * guide and idempotency key added, of POST /bookings/. */
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

/** itin's QuoteOut. `total` is what the customer is charged. */
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

/** A bookable session (itin GET /experiences/{id}/sessions). */
export type ExperienceSession = {
  /** UTC start; send it back unchanged as `requested_datetime`. */
  starts_at: string;
  /** Date and time where the experience runs ("2030-06-01", "09:00:00"). */
  local_date: string;
  local_time: string;
  /** null when the experience doesn't limit seats. */
  seats_left: number | null;
  sold_out: boolean;
};

export type ExperienceSessions = {
  /** The experience's IANA zone; local_* fields are in it. */
  timezone: string;
  /** false when admins set no schedule: any future time is accepted. */
  scheduled: boolean;
  sessions: ExperienceSession[];
};

/** The part of itin's BookingOut the panel needs. */
export type BookingOut = {
  id: string;
  status: string;
  payment_status: string;
  url?: string | null;
};

export type CreateBookingPayload = PricingSelection & {
  /** Sent as the Idempotency-Key header: the same key always returns the
   * same booking, so a double click can't create two. */
  idempotencyKey: string;
  guide_id: string;
};
