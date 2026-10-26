import { describe, expect, it } from "vitest";

import { LISTING_FILTER_GROUPS, toFilterParams } from "./listing-filters";

describe("toFilterParams", () => {
  it("turns the picked options into the listing query's params", () => {
    expect(toFilterParams({})).toEqual({});
    expect(toFilterParams({ price: "5000-10000", duration: "over-4h", time: "night" })).toEqual({
      price_min: 5000,
      price_max: 10000,
      duration_min: 241,
      time_of_day: "night",
    });
  });

  it("ignores an option that doesn't exist", () => {
    expect(toFilterParams({ price: "free-ish" })).toEqual({});
  });

  it("offers price, duration and time of day, each with distinct options", () => {
    expect(LISTING_FILTER_GROUPS.map((g) => g.id)).toEqual(["price", "duration", "time"]);
    for (const group of LISTING_FILTER_GROUPS) {
      const ids = group.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
