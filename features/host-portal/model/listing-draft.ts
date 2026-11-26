import { COMMISSION_RATE } from "./earnings";
import { formatNaira } from "./money";
import type {
  Accessibility,
  AgePolicy,
  BookingType,
  BuilderStepNumber,
  ChecklistItem,
  Choice,
  DraftLocation,
  FitnessLevel,
  CancelTier,
  ListingDraft,
  PriceBreakdown,
  RefundPolicy,
  WhenType,
} from "./listing-draft.types";

export const STEP_LABELS = [
  "Title and description",
  "Category and tags",
  "Location",
  "Date and time",
  "Group size and price",
  "What's included",
  "Requirements and safety",
  "Photos",
  "Reviews",
  "How guests book",
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

/** What a host answers to "Do guests need to know how to swim?", in the words guests see. */
export const SWIM_CHOICES = [
  { label: "Yes", value: "Guests need to know how to swim." },
  { label: "No", value: "Guests don't need to know how to swim." },
] as const;

export const DIETS = ["Vegetarian", "No pork", "Halal", "Nut allergy", "Cannot accommodate"];
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WHEN_TYPES: { key: WhenType; label: string; sub: string }[] = [
  { key: "once", label: "One off", sub: "One date, one time" },
  { key: "recurring", label: "Repeating schedule", sub: "Same days every week" },
  { key: "request", label: "Only on request", sub: "Guests ask, you pick the date" },
];

export const EVERY_OPTIONS = [
  { value: 1, label: "Every week" },
  { value: 2, label: "Every 2 weeks" },
  { value: 4, label: "Once a month" },
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
  title: "", hook: "", desc: "", cats: [], subs: [], tags: [],
  city: "Lagos", area: "", locations: [], cue: "", meetPhoto: "",
  whenType: "", date: "", days: [], every: 1, until: "", slots: [], dur: "",
  minG: "", maxG: "", price: "", priv: "",
  inc: [""], exc: [""], bring: [""], wear: [""],
  agePolicy: "", ageMin: "", fitness: "", swim: "", diet: [], access: "", accessNote: "",
  // Our policy unless the host picks another on "How guests book": a full refund up to 24 hours before.
  refund: "full_refund_until", refundHours: "24",
  weather: false, safetyAgreed: false, photoRightsAgreed: false, photos: [], cover: 0, quote: "", editingId: null,
});

const filled = (lines: string[]) => lines.filter((line) => line.trim());

/** Whether any category picked has subcategories to choose from. Only then is one required. */
export type SubsAvailable = boolean;

/** Which of the eight required sections have everything the review needs. */
export function sectionsDone(d: ListingDraft, subsAvailable: SubsAvailable = true): Record<number, boolean> {
  return {
    1: basicsWritten(d),
    2: categoriesPicked(d, subsAvailable),
    3: Boolean(d.city && mainPin(d) && d.cue && d.meetPhoto),
    4: Boolean(
      d.whenType === "request" ||
        (d.whenType === "once" && d.date && filled(d.slots).length) ||
        (d.whenType === "recurring" && d.days.length && filled(d.slots).length),
    ),
    5: Boolean(Number(d.price) && Number(d.maxG)),
    6: filled(d.inc).length > 0 && filled(d.exc).length > 0,
    7: Boolean(
      isChoice(FITNESS_LEVELS, d.fitness) &&
        isChoice(AGE_POLICIES, d.agePolicy) &&
        (!needsAge(d.agePolicy) || d.ageMin) &&
        isChoice(ACCESS_OPTIONS, d.access) &&
        d.safetyAgreed,
    ),
    8: d.photos.length >= 4 && d.photoRightsAgreed,
  };
}

export const doneCountOf = (d: ListingDraft, subsAvailable: SubsAvailable = true) =>
  Object.values(sectionsDone(d, subsAvailable)).filter(Boolean).length;

const CHECKLIST: [BuilderStepNumber, string][] = [
  [1, "Title, short description and a long description of 100 words or more"],
  [2, "A category, a subcategory and a tag"],
  [3, "A location on the map, a meeting point and a photo"],
  [4, "Date and time"],
  [5, "Group size and price"],
  [6, "What is and is not included"],
  [7, "Requirements and safety, with the safety rules ticked"],
  [8, "Four photos or more, with the photo rights ticked"],
];

export function checklistFor(d: ListingDraft, subsAvailable: SubsAvailable = true): ChecklistItem[] {
  const done = sectionsDone(d, subsAvailable);
  return CHECKLIST.map(([step, label]) => ({ step, label, ok: done[step] }));
}

export const wordCount = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

/** The long description: enough to picture the whole thing, short enough to read. */
export const DESC_MIN_WORDS = 100;
export const DESC_MAX_WORDS = 1000;
/** The short description: two or three sentences. */
export const HOOK_MAX_WORDS = 100;

export const descLengthOk = (text: string) => {
  const words = wordCount(text);
  return words >= DESC_MIN_WORDS && words <= DESC_MAX_WORDS;
};

/** A location with a map pin. */
export const isPinned = (l: DraftLocation) => l.lat !== null && l.lng !== null;

/** The experience's pin: the first location picked from the map. */
export const mainPin = (d: Pick<ListingDraft, "locations">) => d.locations.find(isPinned) ?? null;

/** A title, a short description and a long one of the right length: what step 1 needs before the host moves on. */
export const basicsWritten = (d: ListingDraft) => Boolean(d.title.trim() && d.hook.trim() && descLengthOk(d.desc));

/** At least one category, subcategory and tag: what step 2 needs before the host moves on. A
 * subcategory only counts when the categories picked have some to choose from. */
export const categoriesPicked = (d: ListingDraft, subsAvailable: SubsAvailable = true) =>
  d.cats.length > 0 && (d.subs.length > 0 || !subsAvailable) && d.tags.length > 0;

/** The furthest step the host can reach: the first of the eight required steps not filled in yet,
 * or the last step once they all are. Each required step has to be done before the next. */
export function firstIncomplete(d: ListingDraft, subsAvailable: SubsAvailable = true): BuilderStepNumber {
  const done = sectionsDone(d, subsAvailable);
  for (let n = 1; n <= 8; n += 1) if (!done[n]) return n as BuilderStepNumber;
  return STEP_LABELS.length as BuilderStepNumber;
}

/** Each category picked, with the subcategories that can be picked under it. */
export function subcategoryGroups(cats: string[], childrenOf: (category: string) => string[]): { category: string; subs: string[] }[] {
  return cats.map((category) => ({ category, subs: childrenOf(category) })).filter((g) => g.subs.length > 0);
}

/** The text cut off after `max` words, spacing kept. Text within the limit comes back as it was. */
export function capWords(text: string, max: number): string {
  const words = text.match(/\s*\S+/g) ?? [];
  return words.length <= max ? text : words.slice(0, max).join("");
}

/** "120 of 1,000 words" */
export const wordCountLine = (words: number, max: number) => `${words.toLocaleString("en-US")} of ${max.toLocaleString("en-US")} words`;

/** Why the long description isn't long enough yet, once the host has started it. */
export function descShortBy(words: number): string | null {
  if (words === 0 || words >= DESC_MIN_WORDS) return null;
  const left = DESC_MIN_WORDS - words;
  return `Write at least ${DESC_MIN_WORDS} words. ${left} to go.`;
}

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

/** Every half hour of the day, as "HH:MM". */
export const TIME_OPTIONS: string[] = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

/** "16:00" as "4:00pm". Anything that is not a time is returned as typed. */
export function formatTime(time: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return time;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]}${h >= 12 ? "pm" : "am"}`;
}

/** The choices for a start time picker, keeping a value that is not on the half hour. */
export const timeChoices = (current: string): string[] =>
  /^\d{1,2}:\d{2}$/.test(current) && !TIME_OPTIONS.includes(current) ? [...TIME_OPTIONS, current].sort() : TIME_OPTIONS;

const minutesOf = (time: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** "16:00" and a length of "3" hours as "19:00", past midnight wrapping round. Empty until both are known. */
export function endTime(start: string, hours: string): string {
  const from = minutesOf(start);
  const length = Number(hours);
  if (from === null || !length) return "";
  const total = (from + Math.round(length * 60)) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** The hours from a start time to an end time, as the builder keeps them: "3", "2.5". An end at or
 * before the start is the next day. Empty until both are known. */
export function hoursBetween(start: string, end: string): string {
  const from = minutesOf(start);
  const to = minutesOf(end);
  if (from === null || to === null) return "";
  const span = (to - from + 1440) % 1440 || 1440;
  return String(Math.round((span / 60) * 100) / 100);
}

/** "4:00pm to 7:00pm" for a start time and a length in hours; empty until both are known. */
export function timeRange(start: string, hours: string): string {
  const end = endTime(start, hours);
  return end ? `${formatTime(start)} – ${formatTime(end)}` : "";
}

export const BOOKING_TYPES: (Choice<BookingType> & { sub: string })[] = [
  { key: "instant", label: "Instant book", sub: "Guests book and pay straight away. You get more bookings, and you cannot say no." },
  { key: "request", label: "Request to book", sub: "You see who is asking before you accept. You must reply within 24 hours or it hurts where you show up in search." },
];

/** What a cancellation policy promises. Only the ones with `hours` can be saved today. */
export const CANCEL_TIERS: CancelTier[] = [
  { key: "Flexible", label: "Flexible", hours: 24, sub: "Full refund until 24 hours before it starts. After that, no refund." },
  { key: "Moderate", label: "Moderate", hours: null, sub: "Full refund until 72 hours before, then 50 percent back until 24 hours before. After that, no refund." },
  { key: "Strict", label: "Strict", hours: 168, sub: "Full refund until 7 days before it starts. After that, no refund." },
];

/** The policy the draft's refund settings add up to, if any. */
export function cancelTierOf(d: Pick<ListingDraft, "refund" | "refundHours">): CancelTier["key"] | "" {
  if (d.refund !== "full_refund_until") return "";
  return CANCEL_TIERS.find((t) => t.hours !== null && String(t.hours) === d.refundHours)?.key ?? "";
}
