import { useInfiniteFilteredExperiences, type ExperienceFilters } from "@/lib/queries/experiences";

import {
  ALL_CATEGORIES,
  ALL_FLAGS,
  DURATION_OPTIONS,
  EVENT_FLAGS,
  EXPERIENCE_FLAGS,
  FOR_YOU_CATEGORY_SLUGS,
  GENRE_CATEGORY_SLUGS,
  ROW_CATEGORIES,
  SUBCATEGORIES,
  TIME_OF_DAY_OPTIONS,
  type CatalogCategory,
} from "./filter-catalog";
import type {
  DateRange,
  DurationBand,
  ListingType,
  PriceRange,
  ResultsFilters,
  RowChip,
  SubRow,
} from "./search-results.types";

export const PRICE_CEILING = 100_000;
export const PRICE_STEP = 1_000;
export const UNDER_15K: PriceRange = { min: null, max: 15_000 };
export const MAX_SUB_ROWS = 2;

export const EMPTY_FILTERS: ResultsFilters = {
  types: [],
  categories: [],
  subcategories: [],
  dateRange: { start: null, end: null },
  price: { min: null, max: null },
  free: false,
  timeOfDay: null,
  duration: null,
  languages: [],
  groups: {},
  flags: {},
  groupSize: 1,
};

const categoryBySlug = new Map(ALL_CATEGORIES.map((c) => [c.slug, c]));
const subcategoryBySlug = new Map(SUBCATEGORIES.map((s) => [s.slug, s]));

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

const SHORT_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export function formatDateRange({ start, end }: DateRange): string {
  if (!start) return "";
  if (!end || start.toDateString() === end.toDateString()) return SHORT_DATE.format(start);
  return `${SHORT_DATE.format(start)} – ${SHORT_DATE.format(end)}`;
}

export function formatPriceRange({ min, max }: PriceRange): string {
  if (min == null && max == null) return "";
  if (min == null) return `Under ${formatNaira(max as number)}`;
  if (max == null) return `Over ${formatNaira(min)}`;
  return `${formatNaira(min)} – ${formatNaira(max)}`;
}

export function hasDateRange(range: DateRange): boolean {
  return range.start !== null;
}

export function hasPrice(price: PriceRange): boolean {
  return price.min !== null || price.max !== null;
}

/** The one type chosen, or null when neither or both are (everything). */
export function activeType(filters: ResultsFilters): ListingType | null {
  return filters.types.length === 1 ? filters.types[0] : null;
}

export function flagValue(filters: ResultsFilters, id: string): boolean {
  const def = ALL_FLAGS.find((f) => f.id === id);
  return filters.flags[id] ?? def?.defaultOn ?? false;
}

/** Genre only shows on Events once Music or Parties is selected. */
export function isGenreVisible(filters: ResultsFilters): boolean {
  return activeType(filters) === "events" && filters.categories.some((slug) => GENRE_CATEGORY_SLUGS.includes(slug));
}

const EXPERIENCE_ONLY_GROUPS = ["booking", "fitness", "included", "style"];
const EVENT_ONLY_GROUPS = ["genre", "seating"];

function omit<T extends Record<string, unknown>>(record: T, keys: string[]): T {
  return Object.fromEntries(Object.entries(record).filter(([k]) => !keys.includes(k))) as T;
}

/** What each filter that applies to one type alone currently holds, so a type change can drop them. */
function typeSpecificCount(filters: ResultsFilters, type: ListingType): number {
  if (type === "experiences") {
    return (
      (filters.duration ? 1 : 0) +
      filters.languages.length +
      (filters.groupSize > 1 ? 1 : 0) +
      EXPERIENCE_ONLY_GROUPS.reduce((n, id) => n + (filters.groups[id]?.length ?? 0), 0) +
      EXPERIENCE_FLAGS.filter((f) => filters.flags[f.id]).length
    );
  }
  return (
    EVENT_ONLY_GROUPS.reduce((n, id) => n + (filters.groups[id]?.length ?? 0), 0) +
    EVENT_FLAGS.filter((f) => f.id in filters.flags && filters.flags[f.id] !== (f.defaultOn ?? false)).length
  );
}

function dropTypeSpecific(filters: ResultsFilters, type: ListingType): ResultsFilters {
  if (type === "experiences") {
    return {
      ...filters,
      duration: null,
      languages: [],
      groupSize: 1,
      groups: omit(filters.groups, EXPERIENCE_ONLY_GROUPS),
      flags: omit(filters.flags, EXPERIENCE_FLAGS.map((f) => f.id)),
    };
  }
  return {
    ...filters,
    groups: omit(filters.groups, EVENT_ONLY_GROUPS),
    flags: omit(filters.flags, EVENT_FLAGS.map((f) => f.id)),
  };
}

/** Subcategories need their category selected, and Genre needs Music or Parties. */
function normalize(filters: ResultsFilters): ResultsFilters {
  const subcategories = filters.subcategories.filter((slug) => {
    const parent = subcategoryBySlug.get(slug)?.parentSlug;
    return parent !== undefined && filters.categories.includes(parent);
  });
  const withSubs = { ...filters, subcategories };
  return isGenreVisible(withSubs) ? withSubs : { ...withSubs, groups: omit(withSubs.groups, ["genre"]) };
}

/**
 * Chooses or clears a type. Choosing one limits categories to its own and adds its filters;
 * whatever no longer applies is removed, and `cleared` says how many filters that was.
 */
export function toggleType(filters: ResultsFilters, type: ListingType): { filters: ResultsFilters; cleared: number } {
  const types = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type];
  const next = activeType({ ...filters, types });
  let result: ResultsFilters = { ...filters, types };
  let cleared = 0;

  (["experiences", "events"] as const).forEach((t) => {
    if (next !== t) {
      cleared += typeSpecificCount(result, t);
      result = dropTypeSpecific(result, t);
    }
  });
  if (next) {
    const keep = (slug: string) => categoryBySlug.get(slug)?.kind === next;
    const dropped = result.categories.filter((s) => !keep(s)).length;
    cleared += dropped;
    result = { ...result, categories: result.categories.filter(keep) };
  }
  const normalized = normalize(result);
  cleared += result.subcategories.length - normalized.subcategories.length;
  return { filters: normalized, cleared };
}

export function normalizeFilters(filters: ResultsFilters): ResultsFilters {
  return normalize(filters);
}

/** Badge on "Filters": every filter that's on, categories and subcategories included. */
export function countActiveFilters(filters: ResultsFilters): number {
  const type = activeType(filters);
  const groups = Object.values(filters.groups).reduce((n, values) => n + values.length, 0);
  const flags = ALL_FLAGS.filter(
    (f) => (type === null || f.scope === type) && filters.flags[f.id] && !f.defaultOn,
  ).length;
  return (
    filters.types.length +
    filters.categories.length +
    filters.subcategories.length +
    (hasDateRange(filters.dateRange) ? 1 : 0) +
    (hasPrice(filters.price) ? 1 : 0) +
    (filters.free ? 1 : 0) +
    (filters.timeOfDay ? 1 : 0) +
    (filters.duration ? 1 : 0) +
    filters.languages.length +
    groups +
    flags +
    (filters.groupSize > 1 ? 1 : 0)
  );
}

function ageLabel(filters: ResultsFilters): string | null {
  const [first, ...rest] = filters.groups.age ?? [];
  if (!first) return null;
  const label = first === "all-ages" ? "All ages" : first === "family-friendly" ? "Family friendly" : first;
  return rest.length ? `${label} +${rest.length}` : label;
}

function languagesLabel(filters: ResultsFilters): string | null {
  const [first, ...rest] = filters.languages;
  if (!first) return null;
  return rest.length ? `${first} +${rest.length}` : first;
}

/**
 * The row after "Filters": selected categories newest first, each followed by its
 * selected subcategories; active chips; the unselected dropdowns; then the other
 * categories, the guest's own first when they took the quiz. (The taste-quiz prompt
 * lives in the panel only.) Derived, so removing a chip puts it back in its slot.
 */
export function buildRowChips(filters: ResultsFilters, { tookQuiz }: { tookQuiz: boolean }): RowChip[] {
  const type = activeType(filters);

  const selected: RowChip[] = filters.categories.flatMap((slug) => {
    const category = categoryBySlug.get(slug);
    if (!category) return [];
    const subs = tookQuiz
      ? filters.subcategories.flatMap((s) => {
          const sub = subcategoryBySlug.get(s);
          return sub?.parentSlug === slug
            ? [{ kind: "subcategory" as const, key: `sub-${s}`, slug: s, label: sub.label }]
            : [];
        })
      : [];
    return [{ kind: "category" as const, key: `cat-${slug}`, slug, label: category.label, selected: true, forYou: false }, ...subs];
  });

  const dateLabel = hasDateRange(filters.dateRange) ? formatDateRange(filters.dateRange) : null;
  const durationLabel = DURATION_OPTIONS.find((o) => o.value === filters.duration)?.label ?? null;
  const filterChips: { chip: RowChip; active: boolean }[] = [
    ...(type
      ? [{ chip: { kind: "active", key: "active-type", id: "type", label: type === "events" ? "Events" : "Experiences" } as RowChip, active: true }]
      : []),
    { chip: { kind: "dropdown", key: "dd-dates", id: "dates", label: dateLabel ?? "Dates", active: dateLabel !== null }, active: dateLabel !== null },
    ...(filters.free || hasPrice(filters.price)
      ? [{ chip: { kind: "active", key: "active-price", id: "price", label: filters.free ? "Free" : formatPriceRange(filters.price) } as RowChip, active: true }]
      : []),
    ...(filters.timeOfDay
      ? [{ chip: { kind: "active", key: "active-time", id: "timeOfDay", label: TIME_OF_DAY_OPTIONS.find((o) => o.value === filters.timeOfDay)?.label ?? "" } as RowChip, active: true }]
      : []),
    ...(type === "experiences"
      ? [
          { chip: { kind: "dropdown", key: "dd-duration", id: "duration", label: durationLabel ?? "Duration", active: durationLabel !== null } as RowChip, active: durationLabel !== null },
          { chip: { kind: "dropdown", key: "dd-languages", id: "languages", label: languagesLabel(filters) ?? "Languages", active: filters.languages.length > 0 } as RowChip, active: filters.languages.length > 0 },
        ]
      : []),
    ...(type === "events"
      ? [{ chip: { kind: "dropdown", key: "dd-age", id: "age", label: ageLabel(filters) ?? "Age limit", active: ageLabel(filters) !== null } as RowChip, active: ageLabel(filters) !== null }]
      : []),
  ];

  const pool: CatalogCategory[] = ROW_CATEGORIES.filter((c) => (!type || c.kind === type) && !filters.categories.includes(c.slug));
  const ownFirst = tookQuiz
    ? [...pool.filter((c) => FOR_YOU_CATEGORY_SLUGS.includes(c.slug)), ...pool.filter((c) => !FOR_YOU_CATEGORY_SLUGS.includes(c.slug))]
    : pool;
  const rest: RowChip[] = ownFirst.map((c) => ({
    kind: "category",
    key: `cat-${c.slug}`,
    slug: c.slug,
    label: c.label,
    selected: false,
    forYou: tookQuiz && FOR_YOU_CATEGORY_SLUGS.includes(c.slug),
  }));

  return [
    ...selected,
    ...filterChips.filter((c) => c.active).map((c) => c.chip),
    ...filterChips.filter((c) => !c.active).map((c) => c.chip),
    ...rest,
  ];
}

/** Sub-rows under the main row for selected categories that have subcategories (quiz taken), at most two. */
export function buildSubRows(filters: ResultsFilters, tookQuiz: boolean): SubRow[] {
  if (!tookQuiz) return [];
  return filters.categories
    .flatMap((parentSlug) => {
      const subs = SUBCATEGORIES.filter((s) => s.parentSlug === parentSlug);
      if (!subs.length) return [];
      const picked = filters.subcategories.filter((s) => subs.some((x) => x.slug === s));
      const items = [
        ...picked.map((slug) => ({ slug, label: subcategoryBySlug.get(slug)?.label ?? slug, selected: true })),
        ...subs.filter((s) => !picked.includes(s.slug)).map((s) => ({ slug: s.slug, label: s.label, selected: false })),
      ];
      return [
        {
          parentSlug,
          title: categoryBySlug.get(parentSlug)?.label ?? parentSlug,
          allSelected: picked.length === 0,
          items,
        },
      ];
    })
    .slice(0, MAX_SUB_ROWS);
}

/** "Lagos" -> "Things to do in Lagos"; any other search is shown as typed. */
export function buildResultsHeading(subject: { kind: "city" | "category" | "query"; label: string }): string {
  switch (subject.kind) {
    case "city":
      return `Things to do in ${subject.label}`;
    case "category":
      return subject.label;
    case "query":
      return `Results for “${subject.label}”`;
  }
}

export function formatResultsCount(total: number | undefined): string {
  if (total === undefined) return "";
  return `(${total} ${total === 1 ? "result" : "results"})`;
}

/** What the panel's footer button counts: "50 experiences", "12 events" or "50 results". */
export function resultsNoun(filters: ResultsFilters, total: number): string {
  const type = activeType(filters);
  if (type === "events") return total === 1 ? "event" : "events";
  if (type === "experiences") return total === 1 ? "experience" : "experiences";
  return total === 1 ? "result" : "results";
}

export function durationBand(value: DurationBand | null) {
  return DURATION_OPTIONS.find((o) => o.value === value);
}

/** Maps the filter state to what the listing API understands today. Everything else is held in state only. */
export function toExperienceFilters(filters: ResultsFilters): ExperienceFilters {
  const duration = durationBand(filters.duration);
  return {
    // The listing takes one interest slug: the newest subcategory, else the newest category.
    interest: filters.subcategories[0] ?? filters.categories[0],
    price_min: filters.free ? undefined : (filters.price.min ?? undefined),
    price_max: filters.free ? 0 : (filters.price.max ?? undefined),
    duration_min: duration?.min ?? undefined,
    duration_max: duration?.max ?? undefined,
    time_of_day: filters.timeOfDay ?? undefined,
  };
}

export function useResultsListing(params: {
  city?: string;
  /** The category the page is about; a category chosen in the row takes over from it. */
  interest?: string;
  search?: string;
  filters: ResultsFilters;
  pageSize: number;
}) {
  const mapped = toExperienceFilters(params.filters);
  return useInfiniteFilteredExperiences({
    city: params.city,
    search: params.search,
    pageSize: params.pageSize,
    ...mapped,
    interest: mapped.interest ?? params.interest,
  });
}

