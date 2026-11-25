import type { EventBookingData } from "@/features/booking";

// The event page's data contract, written from the design (Figma "Event
// details" 2470:39270). itin has no events API yet, so this is the shape the
// page reads and the shape GET /events/{id} is expected to return. Sections
// the backend leaves empty are not shown.

export type EventTone = 1 | 2 | 3 | 4 | 5;

export type EventIncludedIcon = "talks" | "launch" | "gift" | "meal" | "ticket";

export type EventFactIcon =
  | "ticket"
  | "accessibility"
  | "parking"
  | "transfer"
  | "age"
  | "bag"
  | "dress"
  | "language";

export type EventScheduleKind = "talk" | "launch" | "plain" | "muted";

export type EventDetail = {
  id: string;
  title: string;
  /** "Sat, 14 Nov 2026". */
  dateLabel: string;
  /** "9:00AM to 5:00PM". */
  timeLabel: string;
  /** "Harbour Hall, Victoria Island, Lagos." */
  venueLabel: string;
  /** City, for "More ways to experience Lagos". */
  city: string;
  images: string[];
  about: string;
  organiser: { id: string | null; name: string; verified: boolean; blurb: string };
  place: { name: string; detail: string | null };
  /** What a ticket includes. */
  included: { id: string; icon: EventIncludedIcon; label: string }[];
  goodToKnow: { id: string; icon: EventFactIcon; title: string; body: string }[];
  lineup: { id: string; name: string; role: string; bio: string; imageUrl: string | null; tone: EventTone }[];
  questions: { id: string; question: string; answer: string }[];
  /** The full address, under the map. */
  address: string;
  schedule: { id: string; time: string; title: string; detail: string | null; kind: EventScheduleKind }[];
  /** Category cards; `slug` is the category's page, /categories/{slug}. */
  moreWays: { id: string; slug: string; title: string; subtitle: string }[];
  knowBeforeYouGo: string[];
  pastEvents: { id: string; title: string; imageUrl: string | null; tone: EventTone }[];
  similar: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    duration: string;
    rating: number;
    priceFrom: number;
    currency: string;
  }[];
  booking: EventBookingData;
};
