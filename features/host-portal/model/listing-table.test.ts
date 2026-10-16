import { describe, expect, it } from "vitest";

import {
  CATEGORY_TREE,
  filterListings,
  hasActiveFilters,
  listingsSummary,
  NO_FILTERS,
  RATING_OPTIONS,
  resultLine,
  rowActions,
  sortListings,
  STATUS_OPTIONS,
} from "./listing-table";
import { formatNaira } from "./money";
import { SAMPLE_LISTINGS } from "./sample-listings";

const titles = (list: { title: string }[]) => list.map((l) => l.title);

describe("filterListings", () => {
  it("returns everything with no filters", () => {
    expect(filterListings(SAMPLE_LISTINGS, NO_FILTERS)).toHaveLength(8);
  });

  it("filters by status", () => {
    expect(titles(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, status: "Live" }))).toEqual(["Lagos Island Photowalk"]);
  });

  it("filters by category, then subcategory", () => {
    const art = filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, category: "Art & creativity" });
    expect(art).toHaveLength(3);
    expect(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, category: "Water activity", subcategory: "Boat cruise" })).toHaveLength(1);
  });

  it("filters by rating", () => {
    expect(titles(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, rating: "4.5 and up" }))).toEqual([
      "Lagos Island Photowalk",
      "Harmattan Portrait Session",
      "Film Only Boat Morning",
      "Freedom Park Portraits",
      "Makoko Boat Stories",
    ]);
    expect(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, rating: "4 and up" })).toHaveLength(5);
    expect(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, rating: "Not rated yet" })).toHaveLength(3);
  });

  it("searches titles, ignoring case", () => {
    expect(titles(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, q: "PORTRAIT" }))).toEqual([
      "Harmattan Portrait Session",
      "Freedom Park Portraits",
    ]);
  });

  it("combines filters", () => {
    expect(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, category: "Art & creativity", status: "Hidden" })).toHaveLength(1);
    expect(filterListings(SAMPLE_LISTINGS, { ...NO_FILTERS, category: "Street life", status: "Live" })).toHaveLength(0);
  });
});

describe("sortListings", () => {
  it("sorts text both ways, and prices as numbers", () => {
    expect(titles(sortListings(SAMPLE_LISTINGS, "title", 1)).slice(0, 2)).toEqual(["Film Only Boat Morning", "Freedom Park Portraits"]);
    expect(titles(sortListings(SAMPLE_LISTINGS, "title", -1))[0]).toBe("Sunset Kayak and Paint");
    expect(sortListings(SAMPLE_LISTINGS, "price", 1).map((l) => l.price)).toEqual([7500, 8000, 9000, 10000, 12000, 14000, 16000, 18000]);
    expect(sortListings(SAMPLE_LISTINGS, "price", -1)[0].price).toBe(18000);
  });

  it("doesn't change the list it's given, and keeps ties in place", () => {
    const before = titles(SAMPLE_LISTINGS);
    const byStatus = sortListings(SAMPLE_LISTINGS, "cat", 1);
    expect(titles(SAMPLE_LISTINGS)).toEqual(before);
    expect(byStatus.map((l) => l.cat)).toEqual([...byStatus.map((l) => l.cat)].sort());
  });
});

describe("summaries", () => {
  it("words the result count", () => {
    expect(resultLine(8, 8)).toBe("All 8 listings");
    expect(resultLine(1, 8)).toBe("1 listing");
    expect(resultLine(3, 8)).toBe("3 listings");
  });

  it("summarises the page header", () => {
    expect(listingsSummary(SAMPLE_LISTINGS)).toBe("8 listings · 1 live · 1 in review");
    expect(listingsSummary(SAMPLE_LISTINGS.slice(0, 1))).toBe("1 listing · 1 live · 0 in review");
    expect(listingsSummary([])).toBe("Nothing here yet");
  });

  it("knows when a filter is on", () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...NO_FILTERS, q: "x" })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, rating: "4 and up" })).toBe(true);
    expect(hasActiveFilters({ ...NO_FILTERS, subcategory: "Yoga" })).toBe(true);
  });
});

describe("rowActions", () => {
  it("offers the same eight actions, with Delete last and dangerous", () => {
    const live = rowActions(SAMPLE_LISTINGS[0]);
    expect(live.map((a) => a.label)).toEqual([
      "Edit", "Duplicate", "Preview as a guest", "Copy the link", "Hide from search", "Pause new bookings", "Archive", "Delete",
    ]);
    expect(live.filter((a) => a.danger).map((a) => a.action)).toEqual(["delete"]);
  });

  it("offers to show a hidden listing again", () => {
    const hidden = SAMPLE_LISTINGS.find((l) => l.status === "Hidden")!;
    expect(rowActions(hidden).map((a) => a.action)).toContain("show");
    expect(rowActions(hidden).map((a) => a.action)).not.toContain("hide");
  });
});

describe("reference data", () => {
  it("has eight statuses, eight categories with five subcategories each, four rating options", () => {
    expect(STATUS_OPTIONS).toHaveLength(8);
    expect(Object.keys(CATEGORY_TREE)).toHaveLength(8);
    expect(Object.values(CATEGORY_TREE).every((subs) => subs.length === 5)).toBe(true);
    expect(RATING_OPTIONS).toHaveLength(4);
  });

  it("formats naira", () => {
    expect(formatNaira(10000)).toBe("₦10,000");
    expect(formatNaira(7500.4)).toBe("₦7,500");
  });
});
