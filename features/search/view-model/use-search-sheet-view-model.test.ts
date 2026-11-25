import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { clearRecentSearches, readRecentSearches, saveRecentSearch } from "../model/recent-searches";
import { useSearchSheetViewModel } from "./use-search-sheet-view-model";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const quiz = vi.hoisted(() => ({ visible: true, href: "/onboarding" }));
vi.mock("@/features/taste-quiz-cta", () => ({ useTasteQuizCtaViewModel: () => quiz }));

// Friday 20 November 2026.
const NOW = new Date(2026, 10, 20, 15, 30);
const day = (d: number) => new Date(2026, 10, d);

function renderSheet() {
  const onClose = vi.fn();
  const view = renderHookWithProviders(() => useSearchSheetViewModel({ onClose }));
  return { ...view, onClose };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  server.use(
    http.get(apiUrl("/experiences/cities"), () =>
      HttpResponse.json([{ slug: "lagos", name: "Lagos", country: "Nigeria", count: 25, image_url: null }]),
    ),
    http.get(apiUrl("/experiences/filter"), () => HttpResponse.json({ items: [], total: 0 })),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  quiz.visible = true;
  window.localStorage.clear();
  clearRecentSearches();
});

describe("useSearchSheetViewModel", () => {
  it("opens on Where with nothing filled", () => {
    const { result } = renderSheet();

    expect(result.current.openCard).toBe("where");
    expect([result.current.whereSummary, result.current.whenSummary, result.current.whoSummary]).toEqual(["Add place", "Add dates", "Add guests"]);
    expect(result.current.popularAreas.map((a) => a.title)).toEqual(["Lekki", "Victoria Island", "Ikoyi", "Lagos Island", "Surulere", "Yaba", "Ikeja", "Ajah"]);
    expect(result.current.recentSearches).toEqual([]);
  });

  it("moves on to When once a place is picked", () => {
    const { result } = renderSheet();

    act(() => result.current.popularAreas[0].onSelect());
    expect(result.current.whereSummary).toBe("Lekki");
    expect(result.current.openCard).toBe("when");
  });

  it("groups what matches the typed text, keeping the location results, with the letters marked", async () => {
    const { result } = renderSheet();

    act(() => result.current.onWhereChange("lag"));
    expect(result.current.editing).toBe(true);
    // The cities come from the API.
    await waitFor(() => expect(result.current.matchGroups[1]?.rows[0]?.subtitle).toBe("25 experiences"));
    expect(result.current.matchGroups.map((g) => g.label)).toEqual(["Areas", "Destinations"]);

    const [areas, destinations] = result.current.matchGroups;
    expect(areas.rows[0]).toMatchObject({ subtitle: "Area in Lagos", title: [{ text: "Lag", match: true }, { text: "os Island", match: false }] });
    expect(destinations.rows).toHaveLength(1);
    expect(destinations.rows[0]).toMatchObject({ kind: "destination", title: [{ text: "Lag", match: true }, { text: "os, Nigeria", match: false }] });

    act(() => destinations.rows[0].onSelect());
    expect(result.current.editing).toBe(false);
    expect(result.current.whereSummary).toBe("Lagos, Nigeria");
    expect(result.current.openCard).toBe("when");
  });

  it("says nothing matches once the experiences have come back empty too", async () => {
    const { result } = renderSheet();

    act(() => result.current.onWhereChange("qwzx"));
    await waitFor(() => expect(result.current.noMatch).toBe(true), { timeout: 2000 });
    expect(result.current.matchGroups).toEqual([]);
  });

  it("sets dates from the quick picks and the calendar, and names them", () => {
    const { result } = renderSheet();
    const preset = (id: string) => result.current.datePresets.find((p) => p.id === id)!;

    act(() => result.current.onPickPreset(preset("weekend")));
    expect(result.current.whenSummary).toBe("This weekend");
    expect(preset("weekend").selected).toBe(true);

    act(() => result.current.onPickDay(day(24)));
    act(() => result.current.onPickDay(day(26)));
    expect(result.current.whenSummary).toBe("Tue 24 Nov – Thu 26 Nov");
    expect(result.current.datePresets.some((p) => p.selected)).toBe(false);

    act(() => result.current.onPickPreset(preset("anytime")));
    expect(result.current.whenSummary).toBe("Anytime");
    expect(preset("anytime").selected).toBe(true);
  });

  it("Skip leaves the dates empty and moves on to Who", () => {
    const { result } = renderSheet();

    act(() => result.current.onPickDay(day(24)));
    act(() => result.current.onSkipDates());
    expect(result.current.whenSummary).toBe("Add dates");
    expect(result.current.openCard).toBe("who");
  });

  it("counts adults, children and infants, up to 20 in all", () => {
    const { result } = renderSheet();
    const type = (key: string) => result.current.guestTypes.find((g) => g.key === key)!;

    expect(result.current.guestTypes.map((g) => [g.label, g.count, g.canRemove])).toEqual([
      ["Adults", 0, false],
      ["Children", 0, false],
      ["Infants", 0, false],
    ]);
    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.onAddGuest("infants"));
    expect(result.current.whoSummary).toBe("3 guests, 1 infant");
    expect(type("adults").canRemove).toBe(true);
    act(() => result.current.onRemoveGuest("infants"));
    expect(result.current.whoSummary).toBe("2 guests");

    for (let i = 0; i < 25; i++) act(() => result.current.onAddGuest("children"));
    expect(type("children").count).toBe(18);
    expect(result.current.guestTypes.every((g) => !g.canAdd)).toBe(true);
  });

  it("searches everything when nothing is filled, carrying any dates and guests", () => {
    const { result, onClose } = renderSheet();

    act(() => result.current.onSearch());
    expect(push).toHaveBeenLastCalledWith("/search");
    expect(onClose).toHaveBeenCalled();
    expect(readRecentSearches()).toEqual([]);

    act(() => result.current.onPickPreset(result.current.datePresets[1]));
    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.onAddGuest("children"));
    act(() => result.current.onSearch());
    expect(push).toHaveBeenLastCalledWith("/search?date=2026-11-21&until=2026-11-22&guests=2&children=true");
  });

  it("searches a destination the way the search always has: its city page, with the dates and guests", async () => {
    const { result } = renderSheet();
    await waitFor(() => expect(result.current.destinations[0]?.subtitle).toBe("25 experiences"));

    act(() => result.current.destinations[0].onSelect());
    expect(result.current.openCard).toBe("when");
    act(() => result.current.onPickPreset(result.current.datePresets[0]));
    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.onSearch());
    expect(push).toHaveBeenLastCalledWith("/cities/lagos?date=2026-11-20&guests=1");
  });

  it("lists the activities, and searches a picked one on its category page", () => {
    const { result } = renderSheet();

    expect(result.current.activities[0]).toMatchObject({ title: "Local food & drinks", icon: "category" });
    act(() => result.current.activities[0].onSelect());
    act(() => result.current.onSearch());
    expect(push).toHaveBeenLastCalledWith("/categories/local-food-drinks");
  });

  it("searches a place and remembers it as a recent search", () => {
    const { result } = renderSheet();

    act(() => result.current.popularAreas[0].onSelect());
    act(() => result.current.onSearch());
    expect(push).toHaveBeenLastCalledWith("/search?q=Lekki");
    expect(result.current.searching).toBe(true);
    expect(readRecentSearches()).toEqual([{ where: "Lekki", start: null, end: null, guests: { adults: 0, children: 0, infants: 0 } }]);
  });

  it("brings a recent search back with every card closed, dropping days gone by", () => {
    saveRecentSearch({ where: "Yaba", dates: { start: day(21), end: day(22) }, guests: { adults: 2, children: 0, infants: 0 } });
    saveRecentSearch({ where: "Ikoyi", dates: { start: day(7), end: day(7) }, guests: { adults: 3, children: 0, infants: 1 } });
    const { result } = renderSheet();

    expect(result.current.recentSearches.map((r) => [r.title, r.subtitle])).toEqual([
      ["Ikoyi", "Sat 7 Nov · 4 guests, 1 infant"],
      ["Yaba", "This weekend · 2 guests"],
    ]);

    act(() => result.current.recentSearches[1].onSelect());
    expect([result.current.whereSummary, result.current.whenSummary, result.current.whoSummary]).toEqual(["Yaba", "This weekend", "2 guests"]);
    expect(result.current.openCard).toBeNull();

    act(() => result.current.recentSearches[0].onSelect());
    expect(result.current.whenSummary).toBe("Add dates");

    act(() => result.current.onClearRecentSearches());
    expect(result.current.recentSearches).toEqual([]);
  });

  it("Clear all empties every card and reopens Where", () => {
    const { result } = renderSheet();

    act(() => result.current.popularAreas[0].onSelect());
    act(() => result.current.onPickPreset(result.current.datePresets[0]));
    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.onClearAll());
    expect([result.current.whereSummary, result.current.whenSummary, result.current.whoSummary]).toEqual(["Add place", "Add dates", "Add guests"]);
    expect(result.current.openCard).toBe("where");
  });

  it("offers the taste quiz only to people who haven't taken it", () => {
    const { result, rerender } = renderSheet();
    expect(result.current.tasteQuizHref).toBe("/onboarding");

    quiz.visible = false;
    rerender();
    expect(result.current.tasteQuizHref).toBeNull();
  });

  it("asks for location only when Nearby is tapped, then opens the nearest city's results page", async () => {
    let answer: (position: { coords: { latitude: number; longitude: number } }) => void = () => {};
    const getCurrentPosition = vi.fn((done: typeof answer) => {
      answer = done;
    });
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    const { result, onClose } = renderSheet();
    await waitFor(() => expect(result.current.destinations[0]?.subtitle).toBe("25 experiences"));
    expect(getCurrentPosition).not.toHaveBeenCalled();

    act(() => result.current.nearby.onSelect());
    expect(getCurrentPosition).toHaveBeenCalledOnce();
    expect(result.current.nearby.subtitle).toBe("Finding where you are…");

    // Lekki, in Lagos.
    act(() => answer({ coords: { latitude: 6.4474, longitude: 3.4723 } }));
    expect(onClose).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/cities/lagos");
    vi.unstubAllGlobals();
  });

  it("doesn't navigate when the location arrives after the sheet was closed", () => {
    let answer: (position: { coords: { latitude: number; longitude: number } }) => void = () => {};
    const getCurrentPosition = vi.fn((done: typeof answer) => {
      answer = done;
    });
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    const { result, unmount } = renderSheet();

    act(() => result.current.nearby.onSelect());
    unmount();
    answer({ coords: { latitude: 6.4474, longitude: 3.4723 } });
    expect(push).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("stops saying it's finding the location once the answer is in", () => {
    let fail: () => void = () => {};
    const getCurrentPosition = vi.fn((_done: () => void, onError: () => void) => {
      fail = onError;
    });
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    const { result } = renderSheet();

    act(() => result.current.nearby.onSelect());
    expect(result.current.nearby.subtitle).toBe("Finding where you are…");
    act(() => fail());
    expect(result.current.nearby.subtitle).toBe("Find what's around you");
    vi.unstubAllGlobals();
  });

  it("shows everything for the dates and guests when Nearby can't get a location", () => {
    const getCurrentPosition = vi.fn((_done: () => void, fail: () => void) => fail());
    vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
    const { result } = renderSheet();

    act(() => result.current.onAddGuest("adults"));
    act(() => result.current.nearby.onSelect());
    expect(push).toHaveBeenCalledWith("/search?guests=1");
    vi.unstubAllGlobals();
  });

  it("keeps the quick pick that was tapped when two cover the same days", () => {
    vi.setSystemTime(new Date(2026, 10, 22, 10)); // A Sunday: Tonight and This weekend are both today.
    const { result } = renderSheet();
    const weekend = result.current.datePresets.find((p) => p.id === "weekend")!;

    act(() => result.current.onPickPreset(weekend));
    expect(result.current.whenSummary).toBe("This weekend");
    expect(result.current.datePresets.filter((p) => p.selected).map((p) => p.id)).toEqual(["weekend"]);
  });

  it("stops the page behind scrolling while it's open", () => {
    const { unmount } = renderSheet();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
