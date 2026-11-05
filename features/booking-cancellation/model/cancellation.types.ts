/** itin serialises money as decimal strings ("12000.00"). */
type Money = string | number;

/** pending | refunded | approved (cancelled, no refund) | rejected */
export type CancellationOutcome = "pending" | "refunded" | "approved" | "rejected";

/** A cancellation request (itin's RefundRequestOut). Support decides the
 * refund under the booking's policy; nothing is refunded automatically. */
export type CancellationRequest = {
  id: string;
  kind: string;
  status: "open" | "resolved";
  reason?: string | null;
  refund_amount?: Money | null;
  created_at: string;
  resolved_at?: string | null;
  /** Missing on an API that predates outcomes: read `status` instead. */
  outcome?: CancellationOutcome | null;
};

/** What the booking's refund policy gives if the customer cancels now
 * (GET /bookings/{id}/refund-estimate). `eligible` and `amount` are null when
 * support has to judge it (a custom policy, or none). */
export type RefundEstimate = {
  policy?: "full_refund_until" | "non_refundable" | "custom" | null;
  eligible?: boolean | null;
  amount?: Money | null;
  /** UTC, without an offset. */
  deadline?: string | null;
  paid: Money;
  already_refunded: Money;
};

export type CancellationResult = {
  booking_status: string;
  request: CancellationRequest | null;
};
