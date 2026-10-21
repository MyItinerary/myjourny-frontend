import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { groupSizeLabel } from "@/features/booking";
import { useSession } from "@/lib/auth/session-store";
import { formatDuration } from "@/lib/queries/experiences";
import type {
  BeforeYouBookItem,
  BookingWithMeetingPoint,
  ExperienceDetailsFields,
  ExperienceLocation,
  ItineraryStep,
  MeetingPoint,
} from "./experience-details.types";

/** The itinerary, or the older "what you'll do" list as title-only steps. */
export function itinerarySteps(experience: ExperienceDetailsFields): ItineraryStep[] {
  const steps = (experience.itinerary ?? []).filter((step) => step.title?.trim());
  if (steps.length) return steps;
  return (experience.what_you_will_do ?? [])
    .filter((item) => item.trim())
    .map((title) => ({ title, description: null }));
}

// What itin sends when the guide set no safety info. Not worth showing.
const PLACEHOLDER_SAFETY_NOTES = new Set(["Safety info not available"]);
const PLACEHOLDER_EMERGENCY = new Set(["Follow general travel safety disclaimer."]);

/** The guide's own safety notes and emergency guidance, or null. */
export function safetyDescription(safety: ExperienceDetailsFields["safety_info"]): string | null {
  if (!safety) return null;
  const notes = (safety.notes ?? []).map((note) => note.trim()).filter((note) => note && !PLACEHOLDER_SAFETY_NOTES.has(note));
  const emergency = safety.emergencyGuidance?.trim();
  const parts = [...notes, emergency && !PLACEHOLDER_EMERGENCY.has(emergency) ? emergency : null].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** Only what the experience actually says; nothing generic. */
export function beforeYouBookItems(experience: ExperienceDetailsFields): BeforeYouBookItem[] {
  const items: BeforeYouBookItem[] = [];
  const groupSize = groupSizeLabel(experience.group_size_min, experience.group_size_max);
  if (groupSize) {
    items.push({ kind: "guests", label: "Group size", description: groupSize });
  }
  if (experience.energy_level) {
    items.push({
      kind: "activity",
      label: "Activity level",
      description: `This experience is ${experience.energy_level} energy, so pace yourself accordingly`,
    });
  }
  if (experience.duration_minutes) {
    items.push({
      kind: "duration",
      label: "Total time spent",
      description: `This experience runs about ${formatDuration(experience.duration_minutes)}`,
    });
  }
  const { fitness_level, age, accessibility } = experience.requirements ?? {};
  const requirements = [
    fitness_level && `Fitness: ${fitness_level}`,
    age && `Age: ${age}`,
    accessibility && `Accessibility: ${accessibility}`,
  ].filter(Boolean);
  if (requirements.length) {
    items.push({ kind: "requirements", label: "Guest requirements", description: requirements.join(" · ") });
  }
  const included = (experience.whats_included ?? []).filter((item) => item.trim());
  if (included.length) {
    items.push({ kind: "included", label: "What's included", description: included.join(", ") });
  }
  const notIncluded = (experience.whats_not_included ?? []).filter((item) => item.trim());
  if (notIncluded.length) {
    items.push({ kind: "not_included", label: "Not included", description: notIncluded.join(", ") });
  }
  if (experience.what_to_bring?.trim()) {
    items.push({ kind: "bring", label: "What to bring", description: experience.what_to_bring.trim() });
  }
  const safety = safetyDescription(experience.safety_info);
  if (safety) {
    items.push({ kind: "safety", label: "Safety", description: safety });
  }
  if (experience.cancellation_policy?.trim()) {
    items.push({
      kind: "cancellation",
      label: "Cancellation policy",
      description: experience.cancellation_policy.trim(),
    });
  }
  return items;
}

const OSM_EMBED = "https://www.openstreetmap.org/export/embed.html";

/** An OpenStreetMap embed around a point; a pin only for the exact spot. */
export function mapEmbedUrl(latitude: number, longitude: number, { pin }: { pin: boolean }): string {
  // A wider box for the rounded area, so it doesn't look like a precise spot.
  const half = pin ? 0.006 : 0.03;
  const bbox = [longitude - half, latitude - half, longitude + half, latitude + half]
    .map((n) => n.toFixed(5))
    .join(",");
  const params = new URLSearchParams({ bbox, layer: "mapnik" });
  if (pin) params.set("marker", `${latitude},${longitude}`);
  return `${OSM_EMBED}?${params.toString()}`;
}

export function directionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** The booked traveller's exact meeting point, else the listing's area. */
export function experienceLocation(
  experience: ExperienceDetailsFields,
  meetingPoint?: MeetingPoint | null,
): ExperienceLocation | null {
  const label = [experience.city, experience.country].filter(Boolean).join(", ");
  if (meetingPoint) {
    const instructions = meetingPoint.instructions?.trim() || null;
    const { latitude, longitude } = meetingPoint;
    if (latitude != null && longitude != null) {
      return {
        mode: "exact",
        label,
        latitude,
        longitude,
        instructions,
        embedUrl: mapEmbedUrl(latitude, longitude, { pin: true }),
        directionsUrl: directionsUrl(latitude, longitude),
      };
    }
    if (instructions) return { mode: "exact-text", label, instructions };
  }
  if (experience.latitude != null && experience.longitude != null) {
    return {
      mode: "approximate",
      label,
      embedUrl: mapEmbedUrl(experience.latitude, experience.longitude, { pin: false }),
    };
  }
  return label ? { mode: "label", label } : null;
}

export const myConfirmedBookingsKey = ["bookings", "user-list", "confirmed"] as const;

/** The signed-in traveller's confirmed booking for this experience, if any. */
export function useMyBookingForExperience(experienceId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: myConfirmedBookingsKey,
    queryFn: async () => {
      const { data } = await apiClient.get<BookingWithMeetingPoint[]>("/bookings/", {
        params: { status: "confirmed" },
      });
      return data;
    },
    enabled: !!user,
    select: (bookings) => bookings.find((booking) => booking.experience_id === experienceId) ?? null,
  });
}

/** A booking's meeting point as a location, or null when it has none. */
export function meetingPointLocation(meetingPoint?: MeetingPoint | null): ExperienceLocation | null {
  if (!meetingPoint) return null;
  const location = experienceLocation(
    { id: "", city: meetingPoint.city, country: meetingPoint.country },
    meetingPoint,
  );
  return location && location.mode.startsWith("exact") ? location : null;
}
