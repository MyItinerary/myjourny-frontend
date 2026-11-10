/** One of the guide's own experiences, as itin's guide endpoints send it
 * (`GET /guide/experiences` and `GET /guide/experiences/{id}`). Only the
 * fields the dashboard reads. */
export type GuideExperience = {
  id: string;
  /** ACTIVE is live; INACTIVE is incomplete or taken down. */
  status: string;
  /** Why an admin took it down. */
  review_note?: string | null;
  title: string;
  headline?: string | null;
  description?: string | null;
  city?: string | null;
  duration_minutes?: number | null;
  group_size_min?: number | null;
  group_size_max?: number | null;
  interest_tags?: string[] | null;
  schedule_type?: string | null;
  recurrence_days?: string[] | null;
  start_times?: string[] | null;
  price_from?: number | null;
  rating?: number | null;
  review_count?: number;
  cover_image_url?: string | null;
  /** What it still needs before it can go live (publish checklist keys). */
  missing_for_publish?: string[] | null;
  // The single listing also has these.
  whats_included?: string[] | null;
  whats_not_included?: string[] | null;
  meeting_instructions?: string | null;
  meeting_landmark?: string | null;
  fitness_level?: string | null;
  age_policy?: string | null;
  min_age?: number | null;
  weather_dependent?: boolean;
};

/** Interest category slug -> its name, for the Category column. */
export type CategoryNames = Record<string, string>;
