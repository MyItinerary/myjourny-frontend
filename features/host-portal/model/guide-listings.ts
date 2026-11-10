import type { ListingStatus } from "./home.types";
import type { CategoryNames, GuideExperience } from "./guide-listings.types";
import type { DetailAction, ListingDetail } from "./listing-detail.types";
import type { HostListing } from "./listings.types";

// What each publish-checklist key asks the host for, in their words.
const MISSING: Record<string, string> = {
  fitness: "how physical it is",
  age: "the youngest age",
  accessibility: "getting around",
  max_group_size: "a group size",
  meeting_landmark: "a meeting point",
  pin: "a map pin",
  photo: "a photo",
};

const FITNESS: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  high: "High",
  very_high: "Very high",
  not_applicable: "Not physical",
};

const DAY_NAMES: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};

/** Live, taken down by us (with a note), or not finished. */
export function listingStatusOf(exp: Pick<GuideExperience, "status" | "review_note">): ListingStatus {
  if (exp.status === "ACTIVE") return "Live";
  if (exp.status === "DRAFT") return "Draft";
  return exp.review_note ? "Taken down" : "Incomplete";
}

/** "a photo and a map pin" */
export function missingLine(keys: string[]): string {
  const items = keys.map((k) => MISSING[k] ?? k.replace(/_/g, " "));
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

/** Under the title: why it isn't live, or nothing. */
function noteOf(exp: GuideExperience, status: ListingStatus): string | undefined {
  if (status === "Taken down") return `Taken down: ${exp.review_note}`;
  if (status === "Incomplete" && exp.missing_for_publish?.length) return `Still needs ${missingLine(exp.missing_for_publish)}`;
  return undefined;
}

/** "3 hours", "90 minutes", "1 hour" */
export function durationLabel(minutes: number | null | undefined): string {
  if (!minutes) return "";
  if (minutes % 60) return `${minutes} minutes`;
  const hours = minutes / 60;
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

/** "Sat and Sun at 16:00", "One date", "Not set" */
export function cadenceOf(exp: Pick<GuideExperience, "schedule_type" | "recurrence_days" | "start_times">): string {
  const times = (exp.start_times ?? []).map((t) => t.slice(0, 5));
  const at = times.length ? ` at ${times.join(" and ")}` : "";
  if (exp.schedule_type === "one_off") return `One date${at}`;
  if (exp.schedule_type === "recurring" && exp.recurrence_days?.length) {
    const days = exp.recurrence_days.map((d) => DAY_NAMES[d] ?? d);
    const list = days.length > 1 ? `${days.slice(0, -1).join(", ")} and ${days[days.length - 1]}` : days[0];
    return `${list}${at}`;
  }
  return "Not set";
}

export function toHostListing(exp: GuideExperience, names: CategoryNames): HostListing {
  const status = listingStatusOf(exp);
  const [category, subcategory] = exp.interest_tags ?? [];
  return {
    id: exp.id,
    imageUrl: exp.cover_image_url ?? "",
    title: exp.title,
    sub: [exp.city, durationLabel(exp.duration_minutes)].filter(Boolean).join(" · "),
    cat: (category && names[category]) || "No category",
    subcat: (subcategory && names[subcategory]) || "",
    status,
    price: exp.price_from ?? 0,
    next: cadenceOf(exp),
    bookings: "-",
    rating: exp.rating ? exp.rating.toFixed(1) : "-",
    // itin refuses to delete a booked listing, and says why.
    future: 0,
    note: noteOf(exp, status),
  };
}

function youngestAge(exp: GuideExperience): string {
  if (exp.age_policy === "all_ages") return "All ages";
  if (exp.age_policy === "adults_only") return "Adults only";
  if (exp.min_age != null) return exp.age_policy === "adult_required_under" ? `Under ${exp.min_age} with an adult` : `${exp.min_age} and up`;
  return "Not set";
}

const act = (label: string, action: DetailAction) => ({ label, action });

/** The detail page for one of the guide's own listings. Dates, bookings and
 * reviews aren't connected yet, so those parts say so. */
export function toListingDetail(exp: GuideExperience): ListingDetail {
  const status = listingStatusOf(exp);
  const live = status === "Live";
  const min = exp.group_size_min;
  const max = exp.group_size_max;
  return {
    id: exp.id,
    hook: exp.headline ?? "",
    desc: exp.description ?? "",
    inc: exp.whats_included ?? [],
    exc: exp.whats_not_included ?? [],
    cue: exp.meeting_instructions || exp.meeting_landmark || "the meeting point",
    area: exp.city ?? "",
    guests: max ?? 0,
    price: exp.price_from ?? 0,
    payNote: min ? `Smallest group you will run is ${min}.` : "",
    cadence: cadenceOf(exp),
    stats: [],
    dates: [],
    noDates: "Your upcoming dates will show here.",
    reviews: [],
    noReviews: exp.review_count ? `${exp.review_count} reviews so far.` : "No reviews yet.",
    rules: [
      "Instant book",
      min && max ? `${min} to ${max} guests` : max ? `Up to ${max} guests` : "Not set",
      durationLabel(exp.duration_minutes) || "Not set",
      cadenceOf(exp),
      youngestAge(exp),
      (exp.fitness_level && FITNESS[exp.fitness_level]) || "Not set",
      exp.weather_dependent ? "We may move or cancel it" : "It goes ahead",
    ],
    actions: live ? [act("Edit listing", "edit"), act("Copy the link", "copy-link")] : [act("Edit listing", "edit")],
    banner:
      status === "Taken down"
        ? {
            kind: "rejected",
            title: "We took this listing down",
            body: `${exp.review_note} Fix it and publish it again, and it goes straight back up.`,
            button: act("Fix the listing", "fix"),
          }
        : status === "Incomplete"
          ? {
              kind: "review",
              title: "Not live yet",
              body: `Add ${missingLine(exp.missing_for_publish ?? []) || "the missing details"} and publish it to go live.`,
              button: act("Finish the listing", "fix"),
            }
          : undefined,
  };
}
