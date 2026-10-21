/** A review as anyone browsing sees it (first name and last initial). */
export type PublicReview = {
  id: string;
  author_name: string;
  author_avatar_url?: string | null;
  rating: number;
  comment?: string | null;
  created_at: string;
};

/** GET /experiences/{id}/reviews */
export type ExperienceReviewsPage = {
  items: PublicReview[];
  total: number;
  page: number;
  limit: number;
  rating?: number | null;
};

/** The traveller's own review of a booking. */
export type MyReview = {
  id: string;
  booking_id: string;
  experience_id?: string | null;
  rating: number;
  comment?: string | null;
  /** Hidden by MyJourny: the author still sees it, nobody else does. */
  is_hidden: boolean;
  editable_until: string;
  created_at: string;
  updated_at: string;
};

/** GET /bookings/{id}/review */
export type BookingReviewStatus = {
  can_review: boolean;
  reason?: string | null;
  review?: MyReview | null;
};

export type ReviewInput = { rating: number; comment: string };
