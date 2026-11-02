/** One step of an experience's itinerary (itin's ItineraryStep). */
export type ItineraryStep = {
  title: string;
  description?: string | null;
};

/** The fields of itin's ExperienceDetail this feature reads. */
export type ExperienceDetailsFields = {
  id: string;
  city?: string | null;
  country?: string | null;
  // Rounded to about 1 km for everyone but the experience's own guide, and
  // missing for guests.
  latitude?: number | null;
  longitude?: number | null;
  itinerary?: ItineraryStep[] | null;
  what_you_will_do?: string[] | null;
  whats_included?: string[] | null;
  whats_not_included?: string[] | null;
  what_to_bring?: string | null;
  requirements?: {
    fitness_level?: string | null;
    age?: string | null;
    accessibility?: string | null;
  } | null;
  // itin fills in a placeholder when the guide set none; see safetyDescription.
  safety_info?: {
    riskLevel?: string | null;
    notes?: string[] | null;
    emergencyGuidance?: string | null;
  } | null;
  cancellation_policy?: string | null;
  duration_minutes?: number | null;
  group_size_min?: number | null;
  group_size_max?: number | null;
  energy_level?: string | null;
  rating?: number | null;
  description?: string | null;
  // Fit and logistics (itin#113).
  fitness_level?: string | null;
  fitness_note?: string | null;
  age_policy?: string | null;
  min_age?: number | null;
  age_note?: string | null;
  accessibility?: string | null;
  accessibility_note?: string | null;
  languages?: string[] | null;
  weather_dependent?: boolean;
  pickup_available?: boolean;
  pickup_note?: string | null;
  // Public, unlike the booking's meeting instructions.
  meeting_landmark?: string | null;
  meeting_photo_url?: string | null;
  highlights?: string[] | null;
  what_to_bring_items?: string[] | null;
  not_suitable_for?: string[] | null;
  know_before_you_go?: string[] | null;
};

export type FitKind = "fitness" | "age" | "accessibility" | "languages" | "weather" | "pickup";

/** One tile of "Fit and logistics": "Fitness · Moderate", with the host's note. */
export type FitItem = { kind: FitKind; label: string; value: string; note: string | null };

export type ListKind = "highlights" | "bring" | "not_suitable" | "know";

/** A titled list on the page, e.g. "What to bring". */
export type ListSection = { kind: ListKind; title: string; items: string[] };

/** The public meeting landmark and its photo. */
export type MeetingLandmark = { text: string; photoUrl: string | null };

/** Where to meet, from a confirmed booking (itin's BookingMeetingPoint). */
export type MeetingPoint = {
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
  city?: string | null;
  country?: string | null;
};

/** The booking fields this feature reads. */
export type BookingWithMeetingPoint = {
  id: string;
  experience_id?: string | null;
  status: string;
  meeting_point?: MeetingPoint | null;
};

export type BeforeYouBookKind =
  | "guests"
  | "activity"
  | "duration"
  | "requirements"
  | "included"
  | "not_included"
  | "bring"
  | "safety";

export type BeforeYouBookItem = {
  kind: BeforeYouBookKind;
  label: string;
  description: string;
};

/**
 * What the "Where you'll be" section shows:
 * - exact: the booked traveller's meeting point, with a pin.
 * - approximate: the rounded area, no pin.
 * - label: no coordinates, only the city/country.
 */
export type ExperienceLocation =
  | {
      mode: "exact";
      label: string;
      latitude: number;
      longitude: number;
      instructions: string | null;
      embedUrl: string;
      directionsUrl: string;
    }
  | { mode: "exact-text"; label: string; instructions: string }
  | { mode: "approximate"; label: string; embedUrl: string }
  | { mode: "label"; label: string };
