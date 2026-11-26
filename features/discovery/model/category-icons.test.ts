import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { categoryIcon, DEFAULT_SUBCATEGORIES, quizCategorySlugs, slugOf } from "./category-icons";

const onDisk = (src: string) => existsSync(join(process.cwd(), "public", src));

describe("categoryIcon", () => {
  it("gives each category and subcategory in the design its icon, and every icon is on disk", () => {
    expect(categoryIcon("local-food-drinks", "Local food & drinks")).toBe("/images/discovery/categories/street-food-markets.svg");
    expect(categoryIcon("beaches-waterfronts", "Beaches & waterfronts")).toBe("/images/discovery/categories/umbrella-03.svg");
    for (const { id, label } of DEFAULT_SUBCATEGORIES) {
      const src = categoryIcon(id, label);
      expect(src, label).toBeDefined();
      expect(onDisk(src!), src).toBe(true);
    }
  });

  it("finds the icon by name when the slug differs, and has none for an unknown category", () => {
    expect(categoryIcon("cafes", "Cafés & coffee culture")).toBe("/images/discovery/categories/cafes-coffee-culture.svg");
    expect(categoryIcon("pottery", "Pottery")).toBeUndefined();
  });
});

describe("slugOf", () => {
  it("turns a name into our slug shape", () => {
    expect(slugOf("Cafés & coffee culture")).toBe("cafes-coffee-culture");
    expect(slugOf("Historic neighborhoods & landmarks")).toBe("historic-neighborhoods-landmarks");
  });

  it("gives the 21 design subcategories distinct slugs", () => {
    expect(DEFAULT_SUBCATEGORIES).toHaveLength(21);
    expect(new Set(DEFAULT_SUBCATEGORIES.map((s) => s.id)).size).toBe(21);
  });
});

describe("quizCategorySlugs", () => {
  it("turns the quiz's answers into category slugs, once each", () => {
    expect(quizCategorySlugs(["food", "nature", "food"])).toEqual(["local-food-drinks", "nature-outdoors"]);
    expect(quizCategorySlugs(["culture-history"])).toEqual(["culture-history"]);
    expect(quizCategorySlugs(null)).toEqual([]);
  });

  it("files every design subcategory under one of the seven categories", () => {
    expect(new Set(DEFAULT_SUBCATEGORIES.map((s) => s.parent)).size).toBe(7);
  });
});
