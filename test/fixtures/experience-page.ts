import type { ExperienceDetailsViewModel } from "@/features/experience-details";
import type { ExperiencePageContent } from "@/features/experience-page";

export const experienceContent: ExperiencePageContent = {
  id: "exp-1",
  title: "Sunrise Kayaking",
  headline: null,
  durationLabel: "1 hour",
  rating: 4,
  location: "Tarkwa Bay, Lagos",
  host: { id: "h1", name: "Kayak Thrills", verified: true, blurb: "Verified guide" },
  place: { name: "Victoria Island", detail: "Lagos island, Lagos" },
  included: ["Kayak and life jacket"],
  notIncluded: ["Tips for your host"],
  city: "Lagos",
  moreWays: [
    { id: "food", slug: "local-food-drinks", title: "Local food & drinks", subtitle: "Street eats" },
    { id: "nature", slug: "nature-outdoors", title: "Nature & outdoors", subtitle: "Trails and water" },
  ],
};

/** What experience-details works out for the page body. */
export const experienceDetails: ExperienceDetailsViewModel = {
  itinerary: [{ title: "Await hotel pickup", description: "At 6:00 am" }, { title: "Drive to park gate" }],
  beforeYouBook: [
    { kind: "guests", label: "Group size", description: "Up to 8 guests" },
    { kind: "safety", label: "Safety", description: "Life jackets are mandatory" },
  ],
  fit: [{ kind: "fitness", label: "Fitness", value: "Moderate", note: "About 4km of walking" }],
  lists: [
    { kind: "highlights", title: "Highlights", items: ["Calm water.", "A guide beside you."] },
    { kind: "bring", title: "What to bring", items: ["A towel"] },
  ],
  description: { paragraphs: ["Paddle out as the sun comes up."], long: true, expanded: false, onToggle: () => {} },
  rating: "4.0",
  location: { mode: "label", label: "Tarkwa Bay, Lagos" },
  landmark: { text: "Meet at the yellow gate", photoUrl: null },
  isBooked: false,
};
