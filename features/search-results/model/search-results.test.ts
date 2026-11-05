import { describe, expect, it } from "vitest";

import { buildPanel } from "./search-panel";
import {
  activeType,
  buildResultsHeading,
  buildRowChips,
  countActiveFilters,
  EMPTY_FILTERS,
  formatDateRange,
  formatPriceRange,
  formatResultsCount,
  resultsNoun,
  dateRangeFromLink,
  toExperienceFilters,
  toggleType,
} from "./search-results";
import type { ResultsFilters } from "./search-results.types";

const withFilters = (f: Partial<ResultsFilters>): ResultsFilters => ({ ...EMPTY_FILTERS, ...f });
const labels = (f: ResultsFilters, tookQuiz = false) =>
  buildRowChips(f, { tookQuiz }).flatMap((c) => ("label" in c ? [c.label] : []));

describe("buildResultsHeading", () => {
  it("words a city search as things to do", () => {
    expect(buildResultsHeading({ kind: "city", label: "Lagos" })).toBe("Things to do in Lagos");
  });
  it("shows a category as is and a free-text query quoted", () => {
    expect(buildResultsHeading({ kind: "category", label: "Boat cruises" })).toBe("Boat cruises");
    expect(buildResultsHeading({ kind: "query", label: "sunset" })).toBe("Results for “sunset”");
  });
});

describe("formatters", () => {
  it("formats a result count", () => {
    expect(formatResultsCount(undefined)).toBe("");
    expect(formatResultsCount(1)).toBe("(1 result)");
    expect(formatResultsCount(50)).toBe("(50 results)");
  });
  it("formats a date range, a single day and open-ended prices", () => {
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) })).toBe("12 Nov – 21 Nov");
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 12) })).toBe("12 Nov");
    expect(formatPriceRange({ min: null, max: 10000 })).toBe("Under ₦10,000");
    expect(formatPriceRange({ min: 50000, max: null })).toBe("Over ₦50,000");
    expect(formatPriceRange({ min: 10000, max: 25000 })).toBe("₦10,000 – ₦25,000");
  });
  it("names what the footer counts after the chosen type", () => {
    expect(resultsNoun(EMPTY_FILTERS, 50)).toBe("results");
    expect(resultsNoun(withFilters({ types: ["events"] }), 12)).toBe("events");
    expect(resultsNoun(withFilters({ types: ["experiences"] }), 1)).toBe("experience");
    expect(resultsNoun(withFilters({ types: ["experiences", "events"] }), 5)).toBe("results");
  });
});

describe("activeType", () => {
  it("is one type, or none when neither or both are chosen", () => {
    expect(activeType(EMPTY_FILTERS)).toBeNull();
    expect(activeType(withFilters({ types: ["events"] }))).toBe("events");
    expect(activeType(withFilters({ types: ["events", "experiences"] }))).toBeNull();
  });
});

describe("buildRowChips", () => {
  it("lists Dates then experience and event categories mixed by popularity, nothing else", () => {
    const l = labels(EMPTY_FILTERS);
    expect(l.slice(0, 5)).toEqual(["Dates", "Local food & drinks", "Music & live shows", "Culture & history", "Parties & nightlife"]);
    expect(l).not.toContain("Time of day");
    expect(l).not.toContain("Price");
  });

  it("puts selected categories first, newest first, and keeps the rest in their slots", () => {
    const chips = buildRowChips(withFilters({ categories: ["culture-history", "local-food-drinks"] }), { tookQuiz: false });
    expect(chips.slice(0, 2)).toMatchObject([{ slug: "culture-history", selected: true }, { slug: "local-food-drinks", selected: true }]);
    // A selected category isn't also listed with the unselected ones.
    expect(labels(withFilters({ categories: ["culture-history"] })).filter((l) => l === "Culture & history")).toHaveLength(1);
  });

  it("never puts the taste-quiz prompt in the row", () => {
    const f = withFilters({ categories: ["local-food-drinks"] });
    expect(buildRowChips(f, { tookQuiz: false }).every((c) => c.kind !== ("unlock" as string))).toBe(true);
    expect(labels(f).join(" ")).not.toMatch(/taste quiz/i);
  });

  it("puts the quiz taker's own categories first when the row shows categories (events)", () => {
    const chips = buildRowChips(withFilters({ types: ["events"] }), { tookQuiz: true }).filter((c) => c.kind === "category");
    expect(chips.slice(0, 2).map((c) => c.label)).toEqual(["Music & live shows", "Parties & nightlife"]);
  });

  it("after the quiz, shows the subcategories as the only filters to pick from, not the categories", () => {
    const chips = buildRowChips(EMPTY_FILTERS, { tookQuiz: true });
    expect(chips.filter((c) => c.kind === "category")).toEqual([]);
    expect(chips.filter((c) => c.kind === "subcategory").map((c) => c.label)).toEqual([
      "Street food & markets",
      "Bars & nightlife drinks",
      "Cafés & coffee culture",
      "Museums & heritage sites",
      "Historic neighborhoods",
      "Local traditions & festivals",
      "Hiking & trails",
      "Beaches & waterfronts",
      "Parks & green spaces",
    ]);
  });

  it("puts a selected subcategory first, on its own and dark, without needing its category", () => {
    const f = withFilters({ subcategories: ["cafes-coffee-culture"] });
    const chips = buildRowChips(f, { tookQuiz: true });
    expect(chips[0]).toMatchObject({ kind: "subcategory", label: "Cafés & coffee culture", selected: true });
    expect(chips.filter((c) => c.label === "Cafés & coffee culture")).toHaveLength(1);
  });

  it("keeps a selected category as an active chip after the quiz, followed by selected subcategories", () => {
    const f = withFilters({ categories: ["local-food-drinks"], subcategories: ["cafes-coffee-culture"] });
    expect(labels(f, true).slice(0, 2)).toEqual(["Local food & drinks", "Cafés & coffee culture"]);
  });

  it("without the quiz, only categories: never subcategories", () => {
    const f = withFilters({ categories: ["local-food-drinks"], subcategories: ["cafes-coffee-culture"] });
    const chips = buildRowChips(f, { tookQuiz: false });
    expect(chips.some((c) => c.kind === "subcategory")).toBe(false);
    expect(chips.filter((c) => c.kind === "category").length).toBeGreaterThan(5);
  });

  it("keeps categories to pick from when only events are shown, as they have no subcategories", () => {
    const chips = buildRowChips(withFilters({ types: ["events"] }), { tookQuiz: true });
    expect(chips.some((c) => c.kind === "subcategory")).toBe(false);
    expect(chips.some((c) => c.kind === "category")).toBe(true);
  });

  it("limits the row to the chosen type's categories and adds its dropdowns", () => {
    const events = buildRowChips(withFilters({ types: ["events"] }), { tookQuiz: false });
    expect(events.filter((c) => c.kind === "category").every((c) => c.kind === "category" && c.slug !== "local-food-drinks")).toBe(true);
    expect(labels(withFilters({ types: ["events"] }))).toEqual(expect.arrayContaining(["Events", "Dates", "Age limit", "Music & live shows"]));
    const experiences = labels(withFilters({ types: ["experiences"] }));
    expect(experiences).toEqual(expect.arrayContaining(["Experiences", "Duration", "Languages"]));
    expect(experiences).not.toContain("Age limit");
  });

  it("shows active chips with their values before the unselected dropdowns", () => {
    const f = withFilters({
      types: ["experiences"],
      dateRange: { start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) },
      price: { min: null, max: 15000 },
      timeOfDay: "morning",
    });
    expect(labels(f).slice(0, 5)).toEqual(["Experiences", "12 Nov – 21 Nov", "Under ₦15,000", "Morning", "Duration"]);
  });
});

describe("toggleType", () => {
  it("drops the other type's filters and says how many it cleared", () => {
    const f = withFilters({
      types: ["experiences"],
      duration: "half_day",
      languages: ["English"],
      groups: { fitness: ["easy"] },
      flags: { verifiedHost: true },
    });
    const result = toggleType(f, "experiences");
    expect(result.filters.types).toEqual([]);
    expect(result.filters.duration).toBeNull();
    expect(result.filters.languages).toEqual([]);
    expect(result.filters.groups.fitness).toBeUndefined();
    expect(result.filters.flags.verifiedHost).toBeUndefined();
    expect(result.cleared).toBe(4);
  });

  it("removes categories of the other kind when a type is chosen, and their subcategories", () => {
    const f = withFilters({
      categories: ["local-food-drinks", "music-live-shows"],
      subcategories: ["cafes-coffee-culture"],
    });
    const result = toggleType(f, "events");
    expect(result.filters.categories).toEqual(["music-live-shows"]);
    expect(result.filters.subcategories).toEqual([]);
    expect(result.cleared).toBe(2);
  });

  it("keeps everything when both types are chosen", () => {
    const f = withFilters({ types: ["events"], categories: ["music-live-shows"] });
    const result = toggleType(f, "experiences");
    expect(result.filters.types).toEqual(["events", "experiences"]);
    expect(result.filters.categories).toEqual(["music-live-shows"]);
  });
});

describe("countActiveFilters", () => {
  it("counts every filter that's on, categories and subcategories included", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(
      countActiveFilters(
        withFilters({
          types: ["experiences"],
          categories: ["local-food-drinks"],
          subcategories: ["cafes-coffee-culture"],
          dateRange: { start: new Date(2030, 0, 1), end: null },
          price: { min: 0, max: 5000 },
          timeOfDay: "morning",
          duration: "half_day",
          languages: ["English", "Igbo"],
          groups: { area: ["Lekki"] },
          flags: { verifiedHost: true },
          groupSize: 4,
        }),
      ),
    ).toBe(12);
  });

  it("doesn't count Hide sold out while it's on by default", () => {
    expect(countActiveFilters(withFilters({ types: ["events"], flags: { hideSoldOut: true } }))).toBe(1);
  });
});

describe("toExperienceFilters", () => {
  it("maps the state to listing params, newest subcategory first", () => {
    expect(
      toExperienceFilters(
        withFilters({
          categories: ["local-food-drinks"],
          subcategories: ["cafes-coffee-culture"],
          price: { min: 10000, max: 25000 },
          duration: "2_to_4h",
          timeOfDay: "evening",
        }),
      ),
    ).toEqual({
      date: undefined,
      interest: "cafes-coffee-culture",
      price_min: 10000,
      price_max: 25000,
      duration_min: 120,
      duration_max: 240,
      time_of_day: "night",
    });
  });

  it("treats Free as a zero price ceiling", () => {
    expect(toExperienceFilters(withFilters({ free: true }))).toMatchObject({ price_max: 0 });
  });
});

describe("buildPanel", () => {
  it("shows both category groups and the Choose-a-type hint when no type is chosen", () => {
    const panel = buildPanel(EMPTY_FILTERS, { tookQuiz: false });
    expect(panel.categoryGroups.map((g) => g.title)).toEqual(["Experiences", "Events"]);
    expect(panel.typeSection).toBeNull();
    expect(panel.showQuizPrompt).toBe(true);
    expect(panel.featured.map((f) => f.label)).toEqual(["Tonight", "This weekend", "Free", "Under ₦15,000"]);
  });

  it("shows one category group and the type's own filters once a type is chosen", () => {
    const experiences = buildPanel(withFilters({ types: ["experiences"] }), { tookQuiz: false });
    expect(experiences.categoryGroups).toHaveLength(1);
    expect(experiences.typeSection?.title).toBe("Experiences");
    const ids = experiences.typeSection?.blocks.flatMap((b) => (b.kind === "group" ? [b.group.id] : [])) ?? [];
    expect(ids).toEqual(["booking", "fitness", "included", "style", "languages", "duration"]);
  });

  it("shows Genre on Events only once Music or Parties is selected", () => {
    const ids = (f: ResultsFilters) =>
      buildPanel(f, { tookQuiz: false }).typeSection?.blocks.flatMap((b) => (b.kind === "group" ? [b.group.id] : [])) ?? [];
    expect(ids(withFilters({ types: ["events"] }))).toEqual(["seating"]);
    expect(ids(withFilters({ types: ["events"], categories: ["music-live-shows"] }))).toEqual(["genre", "seating"]);
  });

  it("greys options with no matches", () => {
    const panel = buildPanel(withFilters({ types: ["experiences"] }), { tookQuiz: false });
    const languages = panel.typeSection?.blocks.find((b) => b.kind === "group" && b.group.id === "languages");
    expect(languages?.kind === "group" && languages.group.options.find((o) => o.value === "Hausa")?.disabled).toBe(true);
  });

  it("after the quiz, swaps the quiz prompt and the categories for the subcategories alone, and adds Picked for your taste", () => {
    const panel = buildPanel(withFilters({ subcategories: ["cafes-coffee-culture"] }), { tookQuiz: true });
    expect(panel.showQuizPrompt).toBe(false);
    expect(panel.featured[0].label).toBe("Picked for your taste");
    expect(panel.categoryGroups).toEqual([]);
    expect(panel.subcategories).toHaveLength(9);
    expect(panel.subcategories?.find((s) => s.label === "Cafés & coffee culture")?.selected).toBe(true);
    expect(panel.subcategories?.find((s) => s.label === "Hiking & trails")?.selected).toBe(false);
  });

  it("before the quiz there are only categories, never subcategories", () => {
    const panel = buildPanel(withFilters({ categories: ["local-food-drinks"] }), { tookQuiz: false });
    expect(panel.subcategories).toBeNull();
    expect(panel.categoryGroups.length).toBeGreaterThan(0);
  });

  it("keeps the event categories after the quiz when only events are chosen, as events have no subcategories", () => {
    const panel = buildPanel(withFilters({ types: ["events"] }), { tookQuiz: true });
    expect(panel.subcategories).toBeNull();
    expect(panel.categoryGroups).toHaveLength(1);
  });

  it("defaults Hide sold out on for Events", () => {
    const panel = buildPanel(withFilters({ types: ["events"] }), { tookQuiz: false });
    const flags = panel.typeSection?.blocks.find((b) => b.kind === "flags");
    expect(flags?.kind === "flags" && flags.items.find((i) => i.id === "hideSoldOut")?.on).toBe(true);
  });
});

describe("dates and times the API takes", () => {
  it("sends one day as `date`, and a longer range not at all yet", () => {
    const day = new Date(2030, 5, 1);
    expect(toExperienceFilters(withFilters({ dateRange: { start: day, end: day } })).date).toBe("2030-06-01");
    expect(toExperienceFilters(withFilters({ dateRange: { start: day, end: new Date(2030, 5, 3) } })).date).toBeUndefined();
  });

  it("maps the finer times of day onto the day and night listings store", () => {
    const sent = (timeOfDay: ResultsFilters["timeOfDay"]) => toExperienceFilters(withFilters({ timeOfDay })).time_of_day;
    expect([sent("morning"), sent("afternoon"), sent("evening"), sent("late_night")]).toEqual(["day", "day", "night", "night"]);
  });

  it("reads a results link's dates", () => {
    const first = new Date(2030, 5, 1);
    expect(dateRangeFromLink("2030-06-01")).toEqual({ start: first, end: first });
    expect(dateRangeFromLink("2030-06-01", "2030-06-03")).toEqual({ start: first, end: new Date(2030, 5, 3) });
    expect(dateRangeFromLink("2030-06-01", "2030-05-01")).toEqual({ start: first, end: first });
    expect(dateRangeFromLink("not-a-day")).toEqual({ start: null, end: null });
    expect(dateRangeFromLink()).toEqual({ start: null, end: null });
  });
});
