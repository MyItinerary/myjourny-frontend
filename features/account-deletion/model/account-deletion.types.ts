/** What has to be resolved before itin will delete (anonymise) an account. */
export type DeletionBlockers = {
  /** The person's own bookings that haven't happened yet. */
  upcoming_bookings: number;
  /** Refund requests on their bookings still waiting for an admin. */
  open_refund_requests: number;
  /** Curators: upcoming bookings on their experiences. */
  hosted_upcoming_bookings: number;
  /** Curators: paid bookings whose payout isn't settled. */
  pending_payouts: number;
};

/** GET /auth/me/deletion-preview. Older servers send only the first two. */
export type DeletionPreview = {
  upcoming_booking_count: number;
  review_count: number;
  can_delete?: boolean;
  blockers?: DeletionBlockers;
};

/** One thing standing in the way of deletion, in words. */
export type BlockerNote = { key: string; title: string; body: string };
