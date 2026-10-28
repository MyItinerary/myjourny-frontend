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
};

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
