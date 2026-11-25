import { act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { clearRecentSearches, readRecentSearches, recentSearchDates, saveRecentSearch, useRecentSearches } from "./recent-searches";

const noDates = { start: null, end: null };
const party = (adults: number, children = 0, infants = 0) => ({ adults, children, infants });

afterEach(() => {
  window.localStorage.clear();
  clearRecentSearches();
});

describe("recent searches", () => {
  it("keeps the newest three, newest first", () => {
    for (const where of ["Lekki", "Yaba", "Ikoyi", "Ajah"]) saveRecentSearch({ where, dates: noDates, guests: party(1) });
    expect(readRecentSearches().map((s) => s.where)).toEqual(["Ajah", "Ikoyi", "Yaba"]);
  });

  it("moves a repeated place to the top instead of listing it twice", () => {
    saveRecentSearch({ where: "Lekki", dates: noDates, guests: party(1) });
    saveRecentSearch({ where: "Yaba", dates: noDates, guests: party(1) });
    saveRecentSearch({ where: "lekki", dates: noDates, guests: party(2) });
    expect(readRecentSearches().map((s) => [s.where, s.guests.adults])).toEqual([
      ["lekki", 2],
      ["Yaba", 1],
    ]);
  });

  it("stores the dates as days and gives them back as dates", () => {
    saveRecentSearch({ where: "Lekki", dates: { start: new Date(2026, 10, 21), end: new Date(2026, 10, 22) }, guests: party(2) });
    const [saved] = readRecentSearches();
    expect(saved).toEqual({ where: "Lekki", start: "2026-11-21", end: "2026-11-22", guests: party(2) });
    expect(recentSearchDates(saved)).toEqual({ start: new Date(2026, 10, 21), end: new Date(2026, 10, 22) });
  });

  it("ignores an empty place, anything unreadable, and entries in an older shape", () => {
    saveRecentSearch({ where: "  ", dates: noDates, guests: party(1) });
    expect(readRecentSearches()).toEqual([]);
    window.localStorage.setItem("myjourny:recent-searches", "{not json");
    expect(readRecentSearches()).toEqual([]);
    window.localStorage.setItem("myjourny:recent-searches", JSON.stringify([{ where: "Yaba", start: null, end: null, guests: 2 }]));
    expect(readRecentSearches()).toEqual([]);
  });

  it("updates the hook when one is saved or they're cleared", () => {
    const { result } = renderHookWithProviders(() => useRecentSearches());
    expect(result.current).toEqual([]);

    act(() => saveRecentSearch({ where: "Lekki", dates: noDates, guests: party(1) }));
    expect(result.current.map((s) => s.where)).toEqual(["Lekki"]);

    act(() => clearRecentSearches());
    expect(result.current).toEqual([]);
  });
});
