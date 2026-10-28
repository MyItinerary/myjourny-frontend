import type { ExperienceDetail } from "@/features/experience-details";

export type TicketIcon = "microphone" | "zap" | "shopping_bag" | "ticket" | "drink" | "food" | "music" | "gift";
export type ScheduleKind = "doors" | "session" | "highlight";

export type GoodToKnow = {
  entry_text?: string | null;
  id_required?: boolean;
  student_id_required?: boolean;
  parking_text?: string | null;
  transfer_allowed?: boolean | null;
  /** "YYYY-MM-DD" */
  transfer_deadline?: string | null;
  whats_allowed?: string | null;
  dress_code?: string | null;
};

/** GET /experiences/{id} for an event: the experience fields plus its page's own (itin#117). */
export type EventDetail = ExperienceDetail & {
  venue_name?: string | null;
  address?: string | null;
  area?: string | null;
  map_label?: string | null;
  /** "HH:MM:SS" */
  doors_open_time?: string | null;
  music_start_time?: string | null;
  ticket_includes?: { icon: TicketIcon; text: string }[] | null;
  good_to_know?: GoodToKnow | null;
  lineup_heading?: string | null;
  lineup?: { name: string; photo_url?: string | null; role: string; bio?: string | null }[] | null;
  schedule?: { time: string; title: string; description?: string | null; kind: ScheduleKind; people?: string[] }[] | null;
  faqs?: { question: string; answer: string }[] | null;
  organiser_blurb?: string | null;
  capacity?: number | null;
};

/** A row of the "Good to know" list: "Entry and ID · Bring a photo ID." */
export type GoodToKnowRow = { key: string; title: string; text: string };

export type ScheduleRow = { time: string; title: string; description: string | null; kind: ScheduleKind; people: string | null };

export type LineupCard = { name: string; role: string; bio: string | null; photoUrl: string | null; initials: string };

export type Organiser = { name: string; verified: boolean; blurb: string | null; avatarLetter: string };

/** A card in the "Similar events" and "Past events" rails (GET /experiences/{id}/related). */
export type RelatedListing = {
  id: string;
  title: string;
  kind?: "experience" | "event";
  city?: string | null;
  area?: string | null;
  event_start_date?: string | null;
  cover_image_url?: string | null;
  price_from?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  rating?: number | null;
};

export type RelatedListings = { similar: RelatedListing[]; past_by_organiser: RelatedListing[] };
