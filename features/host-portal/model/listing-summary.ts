import { longDate } from "./calendar";
import { formatNaira } from "./money";
import {
  ACCESS_OPTIONS,
  AGE_POLICIES,
  EVERY_OPTIONS,
  FITNESS_LEVELS,
  SWIM_CHOICES,
  timeRange,
  WEEK_DAYS,
  wordCount,
} from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";
import { orderedPhotos } from "./listing-payload";

/** One line of what the host entered: "Title", "Lagos Island photowalk". Empty values read "Not added". */
export type SummaryRow = { label: string; value: string };

const NOT_ADDED = "Not added";
const or = (value: string) => value.trim() || NOT_ADDED;
const list = (items: string[]) => or(items.map((i) => i.trim()).filter(Boolean).join(", "));
const labelOf = <T extends string>(choices: readonly { key: T; label: string }[], key: string) => choices.find((c) => c.key === key)?.label ?? NOT_ADDED;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function schedule(d: ListingDraft): SummaryRow[] {
  const hours = or(timeRange(d.slots[0] ?? "", d.dur));
  if (d.whenType === "once") {
    return [
      { label: "Schedule", value: "One off" },
      { label: "Date", value: d.date ? longDate(d.date) : NOT_ADDED },
      { label: "Time", value: hours },
    ];
  }
  if (d.whenType === "recurring") {
    const daily = d.every === 1 && WEEK_DAYS.every((day) => d.days.includes(day));
    return [
      { label: "Schedule", value: "Repeating schedule" },
      { label: "Days", value: daily ? "Every day" : list(d.days) },
      { label: "How often", value: daily ? "Every day" : (EVERY_OPTIONS.find((o) => o.value === d.every)?.label ?? NOT_ADDED) },
      { label: "Time", value: hours },
      { label: "Until", value: d.until ? longDate(d.until) : "No end date" },
    ];
  }
  if (d.whenType === "request") return [{ label: "Schedule", value: "Only on request" }];
  return [{ label: "Schedule", value: NOT_ADDED }];
}

/** What the host entered on each of the eight required steps, for the review page. */
export function draftSummary(d: ListingDraft): Record<number, SummaryRow[]> {
  const words = wordCount(d.desc);
  const swim = SWIM_CHOICES.find((c) => c.value === d.swim)?.label ?? NOT_ADDED;
  const age = labelOf(AGE_POLICIES, d.agePolicy);
  const photos = orderedPhotos(d).length;
  return {
    1: [
      { label: "Title", value: or(d.title) },
      { label: "Short description", value: or(d.hook) },
      { label: "Long description", value: words ? plural(words, "word", "words") : NOT_ADDED },
    ],
    2: [
      { label: "Categories", value: list(d.cats) },
      { label: "Subcategories", value: list(d.subs) },
      { label: "Tags", value: list(d.tags) },
    ],
    3: [
      { label: "Locations", value: list(d.locations.map((l) => l.name)) },
      { label: "Meeting point", value: or(d.cue) },
      { label: "Meeting point photo", value: d.meetPhoto ? "Added" : NOT_ADDED },
    ],
    4: schedule(d),
    5: [
      { label: "Guests", value: d.minG && d.maxG ? `${d.minG} to ${d.maxG}` : d.maxG ? `Up to ${d.maxG}` : NOT_ADDED },
      { label: "Price per person", value: Number(d.price) ? formatNaira(Number(d.price)) : NOT_ADDED },
      { label: "Private group", value: Number(d.priv) ? formatNaira(Number(d.priv)) : "No" },
    ],
    6: [
      { label: "Included", value: list(d.inc) },
      { label: "Not included", value: list(d.exc) },
      { label: "What to bring", value: list(d.bring) },
      { label: "What to wear", value: list(d.wear) },
    ],
    7: [
      { label: "Fitness level", value: labelOf(FITNESS_LEVELS, d.fitness) },
      { label: "Who can come", value: d.ageMin && (d.agePolicy === "minimum_age" || d.agePolicy === "adult_required_under") ? `${age}: ${d.ageMin}` : age },
      { label: "Guests need to swim", value: swim },
      { label: "Dietary needs", value: d.diet.length ? d.diet.join(", ") : "None" },
      { label: "Accessibility", value: labelOf(ACCESS_OPTIONS, d.access) },
      { label: "Bad weather could cancel it", value: d.weather ? "Yes" : "No" },
      { label: "Safety rules", value: d.safetyAgreed ? "Agreed" : "Not agreed yet" },
    ],
    8: [
      { label: "Photos", value: photos ? plural(photos, "photo", "photos") : NOT_ADDED },
      { label: "Photo rights", value: d.photoRightsAgreed ? "Agreed" : "Not agreed yet" },
    ],
  };
}
