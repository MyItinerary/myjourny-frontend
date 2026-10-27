import type { ExperienceReviewsData } from "./experience-details.types";

// itin has no reviews endpoint yet. Until it does, the page shows the
// reviews from the design (Figma "Reviews" 2532:48813) so the section is
// complete. Replace with the API response once it exists.
export const SAMPLE_REVIEWS: ExperienceReviewsData = {
  average: 4.8,
  count: 124,
  breakdown: [
    { label: "Host", value: 4.9 },
    { label: "Value", value: 4.7 },
    { label: "Organisation", value: 4.8 },
  ],
  summary:
    "Guests talk about how easy the host makes it for first timers, the food that arrives before anyone is ready for it, and the activity they were surprised to be proud of. A few mention the early start. Most say it was worth it.",
  reviews: [
    {
      id: "ngozi",
      initials: "NA",
      name: "Ngozi A.",
      date: "August 2026",
      rating: 5,
      text: "I have never done anything like this. The host had me going in ten minutes and laughing for the rest of it. Breakfast on the jetty was the surprise nobody warned me about, in the best way.",
      verified: true,
      helpfulCount: 8,
      tone: "sand",
    },
    {
      id: "bayo",
      initials: "BK",
      name: "Bayo K.",
      date: "August 2026",
      rating: 5,
      text: "Booked for me and my sister. Small group, nobody rushed. We started at 7:00am, which turned out to be the right call, because the water was flat and the light was soft, and by the time we got to the jetty the first plates were already out. The host does not hurry anyone and does not need to.",
      verified: true,
      helpfulCount: 3,
      tone: "blue",
    },
    {
      id: "hauwa",
      initials: "HM",
      name: "Hauwa M.",
      date: "July 2026",
      rating: 4,
      text: "The 6:00am slot is the one. The lagoon is flat and the bridge goes gold. Slightly cold on the water, so bring a layer.",
      verified: true,
      helpfulCount: 2,
      tone: "cream",
      hostReply: {
        author: "Reply from your host",
        initials: "HO",
        text: "Thank you, Hauwa. I have added a note about layers to the packing list.",
      },
    },
    {
      id: "chidi",
      initials: "CO",
      name: "Chidi O.",
      date: "July 2026",
      rating: 5,
      text: "Great value once you count the two meals. The start point was easy to find because of the gate photo.",
      verified: true,
      helpfulCount: 1,
      tone: "amber",
    },
  ],
};
