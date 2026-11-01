import { describe, expect, it } from "vitest";

import { DUMMY_LOCAL_FOOD_AND_DRINKS, DUMMY_POPULAR_EVENTS, DUMMY_UNFORGETTABLE_TRAVEL } from "./home-dummy-rails";

describe("home placeholder rails", () => {
  it.each([
    ["popular events", DUMMY_POPULAR_EVENTS],
    ["local food & drinks", DUMMY_LOCAL_FOOD_AND_DRINKS],
    ["unforgettable travel", DUMMY_UNFORGETTABLE_TRAVEL],
  ])("%s has enough cards to scroll and none that link or can be saved", (_name, items) => {
    expect(items.length).toBeGreaterThanOrEqual(4);
    for (const item of items) {
      expect(item.id).toBeUndefined();
      expect(item.href).toBeUndefined();
      expect(item.saveable).toBe(false);
    }
  });
});

describe("unforgettable travel placeholder", () => {
  it("names a city and country for every card, none of them the home city", () => {
    for (const item of DUMMY_UNFORGETTABLE_TRAVEL) {
      expect(item.category).toMatch(/, /);
      expect(item.category).not.toMatch(/LAGOS|NIGERIA/);
    }
  });
});
