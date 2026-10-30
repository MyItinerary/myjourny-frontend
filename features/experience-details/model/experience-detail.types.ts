import type { ItineraryStep } from "./experience-details.types";

/** GET /experiences/{id}: itin's ExperienceDetail (extends ExperienceOut).
 * Guests get no latitude, longitude or booking_url; everyone but the guide
 * gets coordinates rounded to about 1 km. */
export type ExperienceDetail = {
  id: string;
  guide_id?: string | null;
  status: string;
  title: string;
  headline?: string | null;
  description?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  duration_minutes?: number | null;
  group_size_min?: number | null;
  group_size_max?: number | null;
  // "YYYY-MM-DD" for a one-off; prefills the booking calendar.
  event_start_date?: string | null;
  /** Session start times, "HH:MM:SS"; the first is when a one-off starts. */
  start_times?: string[] | null;
  timezone?: string | null;
  /** "experience" or "event"; events have their own page at /events/{id}. */
  kind?: "experience" | "event";
  event_end_date?: string | null;
  schedule_type?: string | null;
  recurrence_type?: string | null;
  recurrence_interval?: number | null;
  recurrence_days?: string[] | null;
  length_days?: number | null;
  price_from?: number | null;
  currency?: string | null;
  interest_tags?: string[] | null;
  energy_level?: string | null;
  safety_badge_count?: number | null;
  rating?: number | null;
  review_count?: number | null;
  cover_image_url?: string | null;
  cancellation_policy?: string | null;
  itinerary?: ItineraryStep[] | null;
  safety_info?: {
    riskLevel?: string;
    notes?: string[];
    mobilityAccessibility?: string;
    emergencyGuidance?: string;
  } | null;
  booking_url?: string | null;
  // The listing books on another site; guests don't get booking_url itself.
  has_external_booking?: boolean;
  whats_included?: string[] | null;
  whats_not_included?: string[] | null;
  why_you_will_like_this?: string[] | null;
  images?: string[] | null;
  host?: {
    id: string;
    display_name?: string | null;
    headline?: string | null;
    about?: string | null;
    is_verified?: boolean | null;
    rating_avg?: number | null;
  } | null;

  // Fit and logistics (itin#113).
  fitness_level?: "easy" | "moderate" | "high" | "very_high" | "not_applicable" | null;
  fitness_note?: string | null;
  age_policy?: "all_ages" | "minimum_age" | "adult_required_under" | "adults_only" | null;
  min_age?: number | null;
  age_note?: string | null;
  accessibility?: "wheelchair_accessible" | "partly_accessible" | "not_suitable" | "not_confirmed" | null;
  accessibility_note?: string | null;
  languages?: string[] | null;
  weather_dependent?: boolean;
  pickup_available?: boolean;
  pickup_note?: string | null;
  // Public, unlike the meeting instructions on a confirmed booking.
  meeting_landmark?: string | null;
  meeting_photo_url?: string | null;
  highlights?: string[] | null;
  what_to_bring_items?: string[] | null;
  not_suitable_for?: string[] | null;
  know_before_you_go?: string[] | null;
  refund_policy?: "full_refund_until" | "non_refundable" | "custom" | null;
  free_cancellation_hours?: number | null;

  // Older fields, still served until every client reads the ones above.
  requirements?: { fitness_level?: string | null; age?: string | null; accessibility?: string | null } | null;
  what_you_will_do?: string[] | null;
  what_to_bring?: string | null;
};
