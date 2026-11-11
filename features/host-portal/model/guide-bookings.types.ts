/** A booking on one of the guide's listings (itin's GuideBookingOut). Money
 * comes as decimal strings. */
export type GuideBooking = {
  id: string;
  experience_id?: string | null;
  experience_title?: string | null;
  status: string;
  payment_status: string;
  payout_status?: string | null;
  /** The session's local start, without a zone: "2026-11-14T16:00:00". */
  requested_datetime?: string | null;
  party_size?: number | null;
  price_total?: string | number | null;
  refunded_amount?: string | number | null;
  guide_earnings_amount?: string | number | null;
  currency?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  line_items?: { label: string; quantity: number }[];
  guest?: { name?: string | null; avatar_url?: string | null; phone?: string | null } | null;
  created_at: string;
};
