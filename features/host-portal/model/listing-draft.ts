import { COMMISSION_RATE } from "./earnings";
import { formatNaira } from "./money";
import type {
  Accessibility,
  AgePolicy,
  BookType,
  BuilderStepNumber,
  ChecklistItem,
  Choice,
  FitnessLevel,
  ListingDraft,
  PriceBreakdown,
  RefundPolicy,
  WhenType,
} from "./listing-draft.types";

export const STEP_LABELS = [
  "The basics",
  "Category and tags",
  "Where you meet",
  "When it runs",
  "Group size and price",
  "What's included",
  "Requirements and safety",
  "Photos",
  "Review and publish",
] as const;

export const CATEGORIES = [
  "Local food & drinks",
  "Culture & history",
  "Nature & outdoors",
  "Art & creativity",
  "Wellness & calm",
  "Street life",
  "Events & live shows",
  "Water activity",
] as const;

export const SUBCATEGORIES: Record<string, string[]> = {
  "Local food & drinks": ["Street food walk", "Market to table", "Cooking class", "Supper club", "Drinks and tasting"],
  "Culture & history": ["Guided history walk", "Museum and gallery", "Architecture walk", "Religious sites", "Storytelling evening"],
  "Nature & outdoors": ["Hike or trail walk", "Cycling", "Birdwatching", "Conservation visit", "Picnic and open air"],
  "Art & creativity": ["Photography walk", "Pottery and ceramics", "Painting and drawing", "Textiles and beading", "Music and recording"],
  "Wellness & calm": ["Yoga", "Breathwork and meditation", "Sound bath", "Spa and hammam", "Fitness class"],
  "Street life": ["Night market walk", "Neighbourhood walk", "Thrift and vintage", "Barbershop and salon", "Football and street games"],
  "Events & live shows": ["Live music", "Comedy night", "Theatre and dance", "Listening session", "Film screening"],
  "Water activity": ["Kayak and canoe", "Boat cruise", "Swimming and beach", "Fishing", "Surf and paddleboard"],
};

export const TAGS = [
  "Photography", "Walking", "Golden hour", "Small group", "Beginner friendly", "History",
  "Street food", "Solo friendly", "Indoors", "Kid friendly", "Quiet", "Physical",
];

export const DIETS = ["Vegetarian", "No pork", "Halal", "Nut allergy", "Cannot accommodate"];
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WHEN_TYPES: { key: WhenType; label: string; sub: string }[] = [
  { key: "once", label: "A one off", sub: "One date, one time" },
  { key: "recurring", label: "A repeating schedule", sub: "Same days every week" },
  { key: "request", label: "Only on request", sub: "Guests ask, you pick the date" },
];

export const EVERY_OPTIONS = [
  { value: 1, label: "Every week" },
  { value: 2, label: "Every 2 weeks" },
  { value: 4, label: "Once a month" },
];

export const BOOK_TYPES: { key: BookType; label: string; sub: string }[] = [
  { key: "instant", label: "Instant book", sub: "Guests book and pay straight away. You get more bookings, and you cannot say no." },
  {
    key: "request",
    label: "Request to book",
    sub: "You see who is asking before you accept. You must reply within 24 hours or it hurts where you show up in search.",
  },
];

export const FITNESS_LEVELS: Choice<FitnessLevel>[] = [
  { key: "easy", label: "Easy" },
  { key: "moderate", label: "Moderate" },
  { key: "high", label: "High" },
  { key: "very_high", label: "Very high" },
  { key: "not_applicable", label: "Not physical" },
];

export const AGE_POLICIES: Choice<AgePolicy>[] = [
  { key: "all_ages", label: "All ages" },
  { key: "minimum_age", label: "From a set age" },
  { key: "adult_required_under", label: "Under a set age with an adult" },
  { key: "adults_only", label: "Adults only" },
];

export const ACCESS_OPTIONS: Choice<Accessibility>[] = [
  { key: "wheelchair_accessible", label: "Wheelchair accessible" },
  { key: "partly_accessible", label: "Partly accessible" },
  { key: "not_suitable", label: "Not suitable for wheelchairs" },
  { key: "not_confirmed", label: "Not sure yet" },
];

export const REFUND_POLICIES: Choice<RefundPolicy>[] = [
  { key: "full_refund_until", label: "Full refund up to a set time before" },
  { key: "non_refundable", label: "No refunds" },
];

/** True for one of the choices; a draft saved before these were choices may hold free text. */
export const isChoice = <T extends string>(choices: Choice<T>[], value: string): value is T => choices.some((c) => c.key === value);

/** Policies that need an age typed in. */
export const needsAge = (policy: ListingDraft["agePolicy"]) => policy === "minimum_age" || policy === "adult_required_under";

export const blankDraft = (): ListingDraft => ({
  title: "", hook: "", desc: "", cat: "", sub: "", tags: [],
  city: "Lagos", area: "", landmark: "", cue: "", meetPhoto: "", lat: null, lng: null,
  whenType: "", date: "", days: [], every: 1, until: "", slots: [], dur: "",
  minG: "", maxG: "", price: "", priv: "",
  inc: [""], exc: [""], bring: [""], wear: [""],
  agePolicy: "", ageMin: "", fitness: "", swim: "", diet: [], access: "", accessNote: "",
  refund: "", refundHours: "",
  weather: false, photos: [], cover: 0, quote: "", bookType: "", editingId: null,
});

const filled = (lines: string[]) => lines.filter((line) => line.trim());

/** Which of the eight sections have everything the review needs. */
export function sectionsDone(d: ListingDraft): Record<number, boolean> {
  return {
    1: Boolean(d.title && d.hook && d.desc.length > 80),
    // Tags have nowhere to live in itin yet, so they can't be required.
    2: Boolean(d.cat),
    3: Boolean(d.city && d.landmark && d.lat !== null && d.lng !== null && d.cue && d.meetPhoto),
    4: Boolean(
      d.whenType === "request" ||
        (d.whenType === "once" && d.date && filled(d.slots).length) ||
        (d.whenType === "recurring" && d.days.length && filled(d.slots).length),
    ),
    5: Boolean(Number(d.price) && Number(d.maxG) && d.refund && (d.refund !== "full_refund_until" || d.refundHours)),
    6: filled(d.inc).length > 0 && filled(d.exc).length > 0,
    7: Boolean(
      isChoice(FITNESS_LEVELS, d.fitness) &&
        isChoice(AGE_POLICIES, d.agePolicy) &&
        (!needsAge(d.agePolicy) || d.ageMin) &&
        isChoice(ACCESS_OPTIONS, d.access),
    ),
    8: d.photos.length >= 4,
  };
}

export const doneCountOf = (d: ListingDraft) => Object.values(sectionsDone(d)).filter(Boolean).length;

const CHECKLIST: [BuilderStepNumber, string][] = [
  [1, "Title, one line and description"],
  [2, "A category"],
  [3, "Meeting point on the map, with a photo"],
  [4, "When it runs"],
  [5, "Group size, price and refunds"],
  [6, "What is and is not included"],
  [7, "Requirements and safety"],
  [8, "Four photos or more"],
];

export function checklistFor(d: ListingDraft): ChecklistItem[] {
  const done = sectionsDone(d);
  return CHECKLIST.map(([step, label]) => ({ step, label, ok: done[step] }));
}

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const DAY_INDEX: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

/** The next five dates a repeating schedule produces, starting from `from`. */
export function upcomingDates(d: ListingDraft, from: Date): string[] {
  const out: string[] = [];
  const first = filled(d.slots)[0] ?? "";
  for (let i = 0; i < 70 && out.length < 5; i += 1) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const week = Math.floor(i / 7);
    if (d.days.some((name) => DAY_INDEX[name] === day.getDay()) && week % (d.every || 1) === 0) {
      out.push(`${day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${first}`);
    }
  }
  return out;
}

export const slotSummary = (d: ListingDraft) =>
  d.days.length ? `${d.days.join(", ")} at ${filled(d.slots).join(" and ")}` : "No days picked yet";

export function priceBreakdown(d: ListingDraft): PriceBreakdown {
  const price = Number(d.price);
  const seats = Number(d.maxG);
  const gross = price * seats;
  const commission = Math.round(gross * COMMISSION_RATE);
  return {
    line: price && seats ? `${seats} guests at ${formatNaira(price)} = ${formatNaira(gross)}` : "Fill in a group size and a price",
    gross: formatNaira(gross),
    commission: formatNaira(commission),
    net: formatNaira(gross - commission),
    perSeat: formatNaira(Math.round(price * (1 - COMMISSION_RATE))),
  };
}

export const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100);

export const metaLine = (d: ListingDraft) =>
  [d.dur && `${d.dur} hours`, d.maxG && `Up to ${d.maxG}`, d.area ? `${d.area}, ${d.city}` : d.city].filter(Boolean).join(" · ");

export const photoLabel = (count: number) => (count === 0 ? "No photos yet" : count === 1 ? "1 photo" : `${count} photos`);

export const photoHint = (count: number) =>
  count >= 4
    ? "Enough to publish. Six or more get booked more often."
    : count === 0
      ? "You need at least four to publish."
      : `You need at least four. You have ${count}.`;

export const bookLabel = (type: ListingDraft["bookType"]) =>
  type === "instant" ? "Book now" : type === "request" ? "Request to book" : "How they book, not set";
