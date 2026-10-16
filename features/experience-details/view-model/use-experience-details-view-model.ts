import {
  beforeYouBookItems,
  experienceLocation,
  itinerarySteps,
  useMyBookingForExperience,
} from "../model/experience-details";
import type {
  BeforeYouBookItem,
  ExperienceDetailsFields,
  ExperienceLocation,
  ItineraryStep,
} from "../model/experience-details.types";

export type ExperienceDetailsViewModel = {
  itinerary: ItineraryStep[];
  beforeYouBook: BeforeYouBookItem[];
  /** "4.8", or null when the experience has no rating yet. */
  rating: string | null;
  location: ExperienceLocation | null;
  /** The viewer has a confirmed booking for this experience. */
  isBooked: boolean;
};

/** `experience` is undefined while it loads; the hook still runs (rules of hooks). */
export function useExperienceDetailsViewModel(
  experienceId: string,
  experience: ExperienceDetailsFields | undefined,
): ExperienceDetailsViewModel {
  const { data: booking } = useMyBookingForExperience(experienceId);
  if (!experience) {
    return { itinerary: [], beforeYouBook: [], rating: null, location: null, isBooked: !!booking };
  }
  return {
    itinerary: itinerarySteps(experience),
    beforeYouBook: beforeYouBookItems(experience),
    rating: experience.rating != null ? experience.rating.toFixed(1) : null,
    location: experienceLocation(experience, booking?.meeting_point),
    isBooked: !!booking,
  };
}
