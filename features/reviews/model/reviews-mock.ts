import type { PublicReview, RatingBreakdownRow } from "./reviews.types";

// Stand-ins until the API serves the summary, the breakdown, host replies and
// helpful votes. Shown only when the preview flag is on and an experience has
// no real reviews.

export const MOCK_REVIEW_TOTAL = 124;
export const MOCK_REVIEW_RATING = 4.8;

export const MOCK_REVIEW_SUMMARY =
  "Guests talk about how easy the host makes it for first timers, the breakfast that arrives before anyone is ready for it, and a painting they were surprised to be proud of. A few mention the early start. Most say it was worth it.";

export const MOCK_RATING_BREAKDOWN: RatingBreakdownRow[] = [
  { label: "Host", value: 4.9 },
  { label: "Value", value: 4.7 },
  { label: "Organisation", value: 4.8 },
];

export const MOCK_REVIEWS: PublicReview[] = [
  {
    id: "mock-1",
    author_name: "Ngozi A.",
    rating: 5,
    comment:
      "I have never been in a kayak. Tunde had me paddling in ten minutes and laughing for the rest of it. Breakfast on the jetty was the surprise nobody warned me about, in the best way.",
    created_at: "2026-08-14T10:00:00",
    verified: true,
    helpful_count: 8,
  },
  {
    id: "mock-2",
    author_name: "Bayo K.",
    rating: 5,
    comment:
      "Booked for me and my sister. The painting is on my wall now and it is not good, but I love it. Small group, nobody rushed. We started at 7:00am, which turned out to be the right call, because the water was flat and the light was soft, and by the time we got to the jetty the first plates were already out. Tunde does not hurry anyone and does not need to.",
    created_at: "2026-08-09T10:00:00",
    verified: true,
    helpful_count: 0,
  },
  {
    id: "mock-3",
    author_name: "Hauwa M.",
    rating: 4,
    comment:
      "The 6:00am slot is the one. The lagoon is flat and the bridge goes gold. Slightly cold on the water, so bring a layer.",
    created_at: "2026-07-21T10:00:00",
    verified: true,
    helpful_count: 2,
    host_reply: {
      author: "Tunde, host",
      text: "Thank you, Hauwa. I have added a note about layers to the packing list.",
    },
  },
  {
    id: "mock-4",
    author_name: "Chidi O.",
    rating: 5,
    comment: "Great value once you count the two meals. The start point was easy to find because of the gate photo.",
    created_at: "2026-07-02T10:00:00",
    verified: true,
    helpful_count: 0,
  },
];
