import { describe, expect, it } from "vitest";

import {
  ALL_CATEGORIES,
  ALL_FLAGS,
  EVENT_CATEGORIES,
  EXPERIENCE_CATEGORIES,
  FOR_YOU_CATEGORY_SLUGS,
  GENRE_CATEGORY_SLUGS,
  ROW_CATEGORIES,
  SUBCATEGORIES,
} from "./filter-catalog";

const unique = (values: string[]) => new Set(values).size === values.length;

describe("filter catalogue", () => {
  it("has 14 experience and 12 event categories with unique slugs, each of its own kind", () => {
    expect(EXPERIENCE_CATEGORIES).toHaveLength(14);
    expect(EVENT_CATEGORIES).toHaveLength(12);
    expect(unique(ALL_CATEGORIES.map((c) => c.slug))).toBe(true);
    expect(EXPERIENCE_CATEGORIES.every((c) => c.kind === "experiences")).toBe(true);
    expect(EVENT_CATEGORIES.every((c) => c.kind === "events")).toBe(true);
  });

  it("mixes experiences and events in the row, every category once", () => {
    expect(ROW_CATEGORIES).toHaveLength(ALL_CATEGORIES.length);
    expect(ROW_CATEGORIES.slice(0, 4).map((c) => c.kind)).toEqual(["experiences", "events", "experiences", "events"]);
  });

  it("only nests subcategories under categories that exist", () => {
    expect(unique(SUBCATEGORIES.map((s) => s.slug))).toBe(true);
    for (const sub of SUBCATEGORIES) {
      expect(ALL_CATEGORIES.some((c) => c.slug === sub.parentSlug)).toBe(true);
    }
  });

  it("points For you and Genre at real categories", () => {
    for (const slug of [...FOR_YOU_CATEGORY_SLUGS, ...GENRE_CATEGORY_SLUGS]) {
      expect(ALL_CATEGORIES.some((c) => c.slug === slug)).toBe(true);
    }
  });

  it("turns Hide sold out on by default and nothing else", () => {
    expect(ALL_FLAGS.filter((f) => f.defaultOn).map((f) => f.id)).toEqual(["hideSoldOut"]);
  });
});
