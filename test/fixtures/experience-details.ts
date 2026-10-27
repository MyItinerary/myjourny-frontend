import type { ExperienceDetailsContent } from "@/features/experience-details";

export const experienceContent: ExperienceDetailsContent = {
  id: "exp-1",
  title: "Sunrise Kayaking",
  headline: null,
  durationLabel: "1 hour",
  rating: 4,
  location: "Tarkwa Bay, Lagos",
  about: "Paddle out as the sun comes up.",
  host: { id: "h1", name: "Kayak Thrills", verified: true, blurb: "Verified guide" },
  place: { name: "Victoria Island", detail: "Lagos island, Lagos" },
  facts: [
    { id: "fitness", icon: "fitness", title: "Fitness level", body: "High activity." },
    { id: "group", icon: "group", title: "Group size", body: "Up to 8 guests" },
  ],
  itinerary: ["Await hotel pickup", "Drive to park gate"],
  highlights: ["Calm water.", "A guide beside you."],
  included: ["Kayak and life jacket"],
  notIncluded: ["Tips for your host"],
  safetyNotes: ["Life jackets are mandatory"],
  cancellationPolicy: null,
};
