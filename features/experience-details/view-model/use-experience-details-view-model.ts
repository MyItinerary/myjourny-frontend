import { useState } from "react";

import {
  beforeYouBookItems,
  descriptionParagraphs,
  experienceLocation,
  fitAndLogistics,
  itinerarySteps,
  listSections,
  meetingLandmark,
  previewParagraphs,
  useMyBookingForExperience,
} from "../model/experience-details";
import type {
  BeforeYouBookItem,
  ExperienceDetailsFields,
  ExperienceLocation,
  FitItem,
  ItineraryStep,
  ListSection,
  MeetingLandmark,
} from "../model/experience-details.types";

// Longer than this, the description starts cut short behind "Show more".
const DESCRIPTION_CLAMP_CHARS = 400;

export type ExperienceDescription = {
  /** The paragraphs to show now: all of them, or the start of a long one. */
  paragraphs: string[];
  /** Long enough to be cut short. */
  long: boolean;
  expanded: boolean;
  onToggle: () => void;
};

export type ExperienceDetailsViewModel = {
  itinerary: ItineraryStep[];
  beforeYouBook: BeforeYouBookItem[];
  /** "Fit and logistics": fitness, age, accessibility, languages, weather, pickup. */
  fit: FitItem[];
  /** Highlights, What to bring, Not suitable for, Know before you go. */
  lists: ListSection[];
  description: ExperienceDescription;
  /** "4.8", or null when the experience has no rating yet. */
  rating: string | null;
  location: ExperienceLocation | null;
  /** The public landmark and photo, shown above the map. */
  landmark: MeetingLandmark | null;
  /** The viewer has a confirmed booking for this experience. */
  isBooked: boolean;
};

/** `experience` is undefined while it loads; the hook still runs (rules of hooks). */
export function useExperienceDetailsViewModel(
  experienceId: string,
  experience: ExperienceDetailsFields | undefined,
): ExperienceDetailsViewModel {
  const { data: booking } = useMyBookingForExperience(experienceId);
  const [expanded, setExpanded] = useState(false);
  const all = descriptionParagraphs(experience?.description);
  const long = all.join(" ").length > DESCRIPTION_CLAMP_CHARS;
  const description: ExperienceDescription = {
    paragraphs: long && !expanded ? previewParagraphs(all, DESCRIPTION_CLAMP_CHARS) : all,
    long,
    expanded,
    onToggle: () => setExpanded((open) => !open),
  };
  if (!experience) {
    return {
      itinerary: [],
      beforeYouBook: [],
      fit: [],
      lists: [],
      description,
      rating: null,
      location: null,
      landmark: null,
      isBooked: !!booking,
    };
  }
  return {
    itinerary: itinerarySteps(experience),
    beforeYouBook: beforeYouBookItems(experience),
    fit: fitAndLogistics(experience),
    lists: listSections(experience),
    description,
    rating: experience.rating != null ? experience.rating.toFixed(1) : null,
    location: experienceLocation(experience, booking?.meeting_point),
    landmark: meetingLandmark(experience),
    isBooked: !!booking,
  };
}
