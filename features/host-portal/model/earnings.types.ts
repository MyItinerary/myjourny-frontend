export type EarningsStatus = "pending" | "partial" | "paid" | "failed" | "cancelled";

export type EarningsTotal = {
  currency: string;
  earned: string;
  pending: string;
  paid_out: string;
};

export type EarningsBooking = {
  booking_id: string;
  experience_title: string;
  /** UTC timestamp, or null when the booking has no session time. */
  session_at: string | null;
  currency: string;
  earned: string;
  pending: string;
  paid_out: string;
  payout_status: EarningsStatus;
};

export type HostEarnings = {
  totals: EarningsTotal[];
  bookings: EarningsBooking[];
};

export type PayoutHistoryItem = {
  id: string;
  booking_id: string;
  experience_title: string | null;
  created_at: string;
  currency: string;
  amount: string;
  reference: string;
};

export type EarningsStat = { label: string; value: string; note: string };

export type EarningsRow = {
  id: string;
  booking: string;
  experience: string;
  date: string;
  currency: string;
  earned: string;
  pending: string;
  paidOut: string;
  status: EarningsStatus;
  statusLabel: string;
};
