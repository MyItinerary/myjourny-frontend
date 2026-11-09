import {
  COLLECTIONS,
  DURATION_OPTIONS,
  EVENT_CATEGORIES,
  EVENT_FLAGS,
  EVENT_GROUPS,
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_FLAGS,
  EXPERIENCE_GROUPS,
  FOR_YOU_CATEGORY_SLUGS,
  LANGUAGE_OPTIONS,
  PLACE_GROUPS,
  SUBCATEGORIES,
  TIME_OF_DAY_OPTIONS,
  TYPE_OPTIONS,
  WHO_IT_SUITS_GROUPS,
  type CatalogOption,
  type ChipGroup,
} from "./filter-catalog";
import { activeType, flagValue, isGenreVisible, UNDER_15K } from "./search-results";
import type {
  PanelBlock,
  PanelCategory,
  PanelGroup,
  PanelModel,
  ResultsFilters,
} from "./search-results.types";

function toGroup(id: string, label: string, options: CatalogOption[], selected: string[]): PanelGroup {
  return {
    id,
    label,
    options: options.map((o) => ({ value: o.value, label: o.label, selected: selected.includes(o.value), disabled: !!o.disabled })),
  };
}

function chipGroup(def: ChipGroup, filters: ResultsFilters): PanelGroup {
  return toGroup(def.id, def.label, def.options, filters.groups[def.id] ?? []);
}

export function isTonight(filters: ResultsFilters): boolean {
  const { start, end } = filters.dateRange;
  const today = new Date();
  return !!start && !!end && start.toDateString() === today.toDateString() && end.toDateString() === start.toDateString();
}

export function isWeekend(filters: ResultsFilters): boolean {
  const { start, end } = filters.dateRange;
  return !!start && !!end && start.getDay() === 6 && end.getTime() - start.getTime() === 24 * 60 * 60 * 1000;
}

function flagsBlock(defs: { id: string; label: string }[], filters: ResultsFilters): PanelBlock {
  return { kind: "flags", items: defs.map((f) => ({ id: f.id, label: f.label, on: flagValue(filters, f.id) })) };
}

function groupBlock(def: ChipGroup, filters: ResultsFilters): PanelBlock {
  return { kind: "group", group: chipGroup(def, filters) };
}

function experienceBlocks(filters: ResultsFilters): PanelBlock[] {
  const [booking, fitness, included, style] = EXPERIENCE_GROUPS;
  return [
    groupBlock(booking, filters),
    flagsBlock(EXPERIENCE_FLAGS.slice(0, 3), filters),
    { kind: "stepper", id: "groupSize", label: "Group size", value: filters.groupSize },
    groupBlock(fitness, filters),
    flagsBlock(EXPERIENCE_FLAGS.slice(3), filters),
    groupBlock(included, filters),
    groupBlock(style, filters),
    { kind: "group", group: toGroup("languages", "Languages", LANGUAGE_OPTIONS, filters.languages) },
    { kind: "group", group: toGroup("duration", "Duration", DURATION_OPTIONS, filters.duration ? [filters.duration] : []) },
  ];
}

function eventBlocks(filters: ResultsFilters): PanelBlock[] {
  const [genre, seating] = EVENT_GROUPS;
  return [
    ...(isGenreVisible(filters) ? [groupBlock(genre, filters)] : []),
    groupBlock(seating, filters),
    flagsBlock(EVENT_FLAGS, filters),
  ];
}

/** Everything the "More filters" panel shows for these filters, in order. */
export function buildPanel(filters: ResultsFilters, { tookQuiz }: { tookQuiz: boolean }): PanelModel {
  const type = activeType(filters);
  const toCategory = (c: { slug: string; label: string; kind: PanelCategory["kind"] }): PanelCategory => ({
    ...c,
    selected: filters.categories.includes(c.slug),
  });

  const subcategoriesAlone = tookQuiz && type !== "events";

  const categoryGroups: PanelModel["categoryGroups"] = subcategoriesAlone
    ? []
    : type === "experiences"
      ? [{ title: null, items: EXPERIENCE_CATEGORIES.map(toCategory) }]
      : type === "events"
        ? [{ title: null, items: EVENT_CATEGORIES.map(toCategory) }]
        : [
            { title: "Experiences", items: EXPERIENCE_CATEGORIES.map(toCategory) },
            { title: "Events", items: EVENT_CATEGORIES.map(toCategory) },
          ];

  const subcategories = subcategoriesAlone
    ? SUBCATEGORIES.map((s) => ({ slug: s.slug, label: s.label, selected: filters.subcategories.includes(s.slug) }))
    : null;

  return {
    types: TYPE_OPTIONS.map((t) => ({ ...t, selected: filters.types.includes(t.value) })),
    featured: [
      ...(tookQuiz
        ? [{ id: "pickedForYou" as const, label: "Picked for your taste", selected: FOR_YOU_CATEGORY_SLUGS.every((s) => filters.categories.includes(s) || !categoryAllowed(s, type)) && filters.categories.length > 0 }]
        : []),
      { id: "tonight", label: "Tonight", selected: isTonight(filters) },
      { id: "weekend", label: "This weekend", selected: isWeekend(filters) },
      { id: "free", label: "Free", selected: filters.free },
      { id: "under15k", label: "Under ₦15,000", selected: !filters.free && filters.price.min === null && filters.price.max === UNDER_15K.max },
    ],
    categoryGroups,
    subcategories,
    showQuizPrompt: !tookQuiz,
    collections: chipGroup(COLLECTIONS, filters),
    place: PLACE_GROUPS.map((g) => chipGroup(g, filters)),
    timeOfDay: toGroup("timeOfDay", "Time of day", TIME_OF_DAY_OPTIONS, filters.timeOfDay ? [filters.timeOfDay] : []),
    whoItSuits: WHO_IT_SUITS_GROUPS.map((g) => chipGroup(g, filters)),
    typeSection:
      type === "experiences"
        ? { title: "Experiences", blocks: experienceBlocks(filters) }
        : type === "events"
          ? { title: "Events", blocks: eventBlocks(filters) }
          : null,
  };
}

function categoryAllowed(slug: string, type: ReturnType<typeof activeType>): boolean {
  const all = [...EXPERIENCE_CATEGORIES, ...EVENT_CATEGORIES];
  const kind = all.find((c) => c.slug === slug)?.kind;
  return type === null || kind === type;
}

/** The options behind the row's Duration, Languages and Age limit dropdowns. */
export function buildDropdownGroups(filters: ResultsFilters): Record<"duration" | "languages" | "age", PanelGroup> {
  return {
    duration: toGroup("duration", "Duration", DURATION_OPTIONS, filters.duration ? [filters.duration] : []),
    languages: toGroup("languages", "Languages", LANGUAGE_OPTIONS, filters.languages),
    age: chipGroup(WHO_IT_SUITS_GROUPS[0], filters),
  };
}
