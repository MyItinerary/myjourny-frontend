import type { Category } from "@/lib/queries/categories";

import type { GuideExperience } from "./guide-listings.types";
import { ACCESS_OPTIONS, AGE_POLICIES, blankDraft, FITNESS_LEVELS, isChoice, needsAge, REFUND_POLICIES } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";

/** What itin's `POST /experiences/` and `PUT /experiences/{id}` take from the builder. */
export type ExperiencePayload = {
  title: string;
  status: "ACTIVE";
  headline: string | null;
  description: string | null;
  city: string | null;
  country: string;
  currency: "NGN";
  latitude: number | null;
  longitude: number | null;
  duration_minutes: number | null;
  group_size_min: number | null;
  group_size_max: number | null;
  interest_tags: string[];
  schedule_type: "one_off" | "recurring" | null;
  event_start_date: string | null;
  recurrence_type: "weekly" | null;
  recurrence_interval: number | null;
  recurrence_days: string[] | null;
  recurrence_start_date: string | null;
  recurrence_end_type: "never" | "on_date" | null;
  recurrence_end_date: string | null;
  start_times: string[] | null;
  cover_image_url: string | null;
  images: string[];
  meeting_landmark: string | null;
  meeting_instructions: string | null;
  meeting_photo_url: string | null;
  whats_included: string[];
  whats_not_included: string[];
  what_to_bring_items: string[];
  fitness_level: string | null;
  age_policy: string | null;
  min_age: number | null;
  accessibility: string | null;
  accessibility_note: string | null;
  weather_dependent: boolean;
  refund_policy: string | null;
  free_cancellation_hours: number | null;
  area: string | null;
  tags: string[];
  swim_requirement: string | null;
  dietary_options: string[];
  what_to_wear_items: string[];
  host_note: string | null;
};

/** The builder's two ticket prices, as itin stores them. */
export type ListingPrices = { price: number | null; privatePrice: number | null };

const lines = (list: string[], max: number) =>
  list
    .map((line) => line.trim().slice(0, 140))
    .filter(Boolean)
    .slice(0, max);
const number = (value: string) => (value.trim() && Number.isFinite(Number(value)) ? Number(value) : null);
const text = (value: string, max?: number) => value.trim().slice(0, max) || null;

/** The interest category slug for a name the builder shows, then its subcategory's. */
export function interestTags(tree: Category[], category: string, subcategory: string): string[] {
  const parent = tree.find((c) => c.text === category);
  if (!parent) return [];
  const child = parent.children?.find((c) => c.text === subcategory);
  return child ? [parent.slug, child.slug] : [parent.slug];
}

/** Photos in the order guests swipe through, cover first. */
export function orderedPhotos(d: Pick<ListingDraft, "photos" | "cover">): string[] {
  const cover = d.photos[d.cover];
  return cover ? [cover, ...d.photos.filter((_, i) => i !== d.cover)] : d.photos;
}

/** The listing itin stores for this draft. `today` (YYYY-MM-DD) starts a repeating schedule. */
export function toExperiencePayload(d: ListingDraft, tree: Category[], today: string): ExperiencePayload {
  const slots = lines(d.slots, 24);
  const once = d.whenType === "once";
  const recurring = d.whenType === "recurring";
  const photos = orderedPhotos(d);
  const hours = number(d.dur);
  const age = isChoice(AGE_POLICIES, d.agePolicy) ? d.agePolicy : null;
  const refund = isChoice(REFUND_POLICIES, d.refund) ? d.refund : null;
  return {
    title: d.title.trim(),
    status: "ACTIVE",
    headline: text(d.hook),
    description: text(d.desc),
    city: text(d.city),
    country: "Nigeria",
    currency: "NGN",
    latitude: d.lat,
    longitude: d.lng,
    duration_minutes: hours ? Math.round(hours * 60) : null,
    group_size_min: number(d.minG),
    group_size_max: number(d.maxG),
    interest_tags: interestTags(tree, d.cat, d.sub),
    schedule_type: once ? "one_off" : recurring ? "recurring" : null,
    event_start_date: once ? d.date || null : null,
    recurrence_type: recurring ? "weekly" : null,
    recurrence_interval: recurring ? d.every || 1 : null,
    recurrence_days: recurring ? d.days.map((day) => day.toLowerCase()) : null,
    recurrence_start_date: recurring ? today : null,
    recurrence_end_type: recurring ? (d.until ? "on_date" : "never") : null,
    recurrence_end_date: recurring ? d.until || null : null,
    start_times: once || recurring ? slots : null,
    cover_image_url: photos[0] ?? null,
    images: photos,
    meeting_landmark: text(d.landmark, 120),
    meeting_instructions: text(d.cue, 1000),
    meeting_photo_url: text(d.meetPhoto),
    whats_included: lines(d.inc, 10),
    whats_not_included: lines(d.exc, 10),
    what_to_bring_items: lines(d.bring, 15),
    fitness_level: isChoice(FITNESS_LEVELS, d.fitness) ? d.fitness : null,
    age_policy: age,
    min_age: age && needsAge(age) ? number(d.ageMin) : null,
    accessibility: isChoice(ACCESS_OPTIONS, d.access) ? d.access : null,
    accessibility_note: text(d.accessNote, 100),
    weather_dependent: d.weather,
    refund_policy: refund,
    free_cancellation_hours: refund === "full_refund_until" ? number(d.refundHours) : null,
    area: text(d.area, 120),
    tags: d.tags.slice(0, 12),
    swim_requirement: text(d.swim, 100),
    dietary_options: d.diet.slice(0, 10),
    what_to_wear_items: lines(d.wear, 10),
    host_note: text(d.quote, 140),
  };
}

/** The private group price, or null when the host left it blank. */
export const privatePrice = (d: Pick<ListingDraft, "priv">) => (Number(d.priv) > 0 ? Number(d.priv) : null);

const DAY_LABEL: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const orBlank = (list: string[] | null | undefined) => (list?.length ? list : [""]);
const asText = (value: number | null | undefined) => (value == null ? "" : String(value));

/** A draft for editing one of the guide's listings, with its ticket prices. */
export function draftFromExperience(exp: GuideExperience, tree: Category[], prices: ListingPrices): ListingDraft {
  const [catSlug, subSlug] = exp.interest_tags ?? [];
  const parent = tree.find((c) => c.slug === catSlug);
  const photos = exp.images?.length ? exp.images : exp.cover_image_url ? [exp.cover_image_url] : [];
  const whenType = exp.schedule_type === "one_off" ? "once" : exp.schedule_type === "recurring" ? "recurring" : "request";
  return {
    ...blankDraft(),
    editingId: exp.id,
    title: exp.title,
    hook: exp.headline ?? "",
    desc: exp.description ?? "",
    cat: parent?.text ?? "",
    sub: parent?.children?.find((c) => c.slug === subSlug)?.text ?? "",
    city: exp.city ?? "Lagos",
    area: exp.area ?? "",
    landmark: exp.meeting_landmark ?? "",
    cue: exp.meeting_instructions ?? "",
    meetPhoto: exp.meeting_photo_url ?? "",
    lat: exp.latitude ?? null,
    lng: exp.longitude ?? null,
    whenType,
    date: exp.event_start_date ?? "",
    days: (exp.recurrence_days ?? []).map((day) => DAY_LABEL[day] ?? day),
    every: exp.recurrence_interval ?? 1,
    until: exp.recurrence_end_date ?? "",
    slots: (exp.start_times ?? []).map((t) => t.slice(0, 5)),
    dur: exp.duration_minutes ? String(exp.duration_minutes / 60) : "",
    minG: asText(exp.group_size_min),
    maxG: asText(exp.group_size_max),
    price: asText(prices.price),
    priv: asText(prices.privatePrice),
    inc: orBlank(exp.whats_included),
    exc: orBlank(exp.whats_not_included),
    bring: orBlank(exp.what_to_bring_items),
    fitness: isChoice(FITNESS_LEVELS, exp.fitness_level ?? "") ? (exp.fitness_level as ListingDraft["fitness"]) : "",
    agePolicy: isChoice(AGE_POLICIES, exp.age_policy ?? "") ? (exp.age_policy as ListingDraft["agePolicy"]) : "",
    ageMin: asText(exp.min_age),
    access: isChoice(ACCESS_OPTIONS, exp.accessibility ?? "") ? (exp.accessibility as ListingDraft["access"]) : "",
    accessNote: exp.accessibility_note ?? "",
    refund: isChoice(REFUND_POLICIES, exp.refund_policy ?? "") ? (exp.refund_policy as ListingDraft["refund"]) : "",
    refundHours: asText(exp.free_cancellation_hours),
    weather: Boolean(exp.weather_dependent),
    tags: exp.tags ?? [],
    swim: exp.swim_requirement ?? "",
    diet: exp.dietary_options ?? [],
    wear: orBlank(exp.what_to_wear_items),
    quote: exp.host_note ?? "",
    photos,
    cover: 0,
  };
}
