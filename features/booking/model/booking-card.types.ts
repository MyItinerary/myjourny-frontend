// What the experience and event booking cards show. The cards are driven
// entirely by these shapes, so the backend only has to fill them in.

/** Icons the policy rows can show. */
export type BookingCardInfoIcon = "cancellation" | "refund" | "weather" | "group";

/** A policy line under the button: cancellation, refunds, weather, minimum group. */
export type BookingCardInfoRow = {
  id: string;
  icon: BookingCardInfoIcon;
  title: string;
  body: string;
};

/** The headline price: "₦16,000 per person", or "From ₦7,500 per ticket". */
export type BookingCardPrice = {
  prefix?: string | null;
  amount: string;
  unit: string;
};

/** The total above the button. `amount` is the live figure; `hint` says what
 * is missing ("Select a time") while nothing can be priced. */
export type BookingCardTotal = {
  amount: string | null;
  hint: string | null;
  note: string | null;
};

export type BookingCardAction = {
  label: string;
  disabled: boolean;
  pending: boolean;
  onClick: () => void;
};

/** Where an event ticket tier stands. */
export type EventTierStatus = "available" | "sold_out" | "ended" | "locked";

/** The small note under a tier: amber only for a real count, grey for a plain
 * note, ink for a statement like "Sold out" or "Final release". */
export type EventTierMarker = {
  tone: "urgency" | "plain" | "strong";
  label: string;
};

/** One ticket tier of an event, as the backend describes it. */
export type EventTicketTier = {
  id: string;
  name: string;
  description?: string | null;
  /** Price of one ticket (or one table, when it seats several). */
  amount: number;
  /** "₦20,000 per person", for tiers that seat a group. */
  perPersonAmount?: number | null;
  status: EventTierStatus;
  marker?: EventTierMarker | null;
  /** Most of this tier one booking can hold. */
  maxQuantity: number;
};

/** An event's ticketing, as the booking card needs it. */
export type EventBookingData = {
  currency: string;
  /** "Saturday 12 September 2026" and "Doors 6:00pm · Music from 7:00pm". */
  date: { title: string; subtitle: string | null };
  tiers: EventTicketTier[];
};
