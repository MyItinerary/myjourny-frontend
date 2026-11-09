import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useSearchResultsViewModel } from "./use-search-results-view-model";

let audience = "guest";
vi.mock("@/features/taste-quiz-cta", () => ({
  useTasteQuizAudience: () => audience,
  useTasteQuizCtaViewModel: () => ({ visible: audience !== "taken", href: "/onboarding" }),
}));

function mockApi(onFilter?: (params: URLSearchParams) => void) {
  server.use(
    http.get(apiUrl("/experiences/filter"), ({ request }) => {
      onFilter?.(new URL(request.url).searchParams);
      return HttpResponse.json({
        items: [{ id: "exp-1", title: "Kayaking", city: "Lagos", duration_minutes: 60, rating: 4, price_from: 10000, currency: "NGN" }],
        total: 50,
        page: 1,
        limit: 16,
        total_pages: 1,
      });
    }),
  );
}

function setup(quiz: "guest" | "taken" = "guest") {
  audience = quiz;
  return renderHookWithProviders(() =>
    useSearchResultsViewModel({ subject: { kind: "city", label: "Lagos" }, city: "Lagos" }),
  );
}

describe("useSearchResultsViewModel", () => {
  it("words the heading from the search and shows the count once loaded", async () => {
    mockApi();
    const { result } = setup();

    expect(result.current.heading).toBe("Things to do in Lagos");
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.countLabel).toBe("(50 results)");
    expect(result.current.footerLabel).toBe("Show 50 results");
    expect(result.current.items).toHaveLength(1);
  });

  it("lists selected categories newest first and counts them in the badge", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleCategory("local-food-drinks"));
    act(() => result.current.toggleCategory("music-live-shows"));

    expect(result.current.filters.categories).toEqual(["music-live-shows", "local-food-drinks"]);
    expect(result.current.filterCount).toBe(2);
    expect(result.current.rowChips[0]).toMatchObject({ slug: "music-live-shows", selected: true });

    act(() => result.current.toggleCategory("music-live-shows"));
    expect(result.current.filterCount).toBe(1);
  });

  it("sends the filters to the listing and refetches", async () => {
    const seen: URLSearchParams[] = [];
    mockApi((p) => seen.push(p));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPrice({ min: 10000, max: 25000 }));
    act(() => result.current.toggleOption("duration", "2_to_4h"));

    await waitFor(() => {
      const last = seen[seen.length - 1];
      expect(last.get("price_min")).toBe("10000");
      expect(last.get("price_max")).toBe("25000");
      expect(last.get("duration_min")).toBe("120");
      expect(last.get("duration_max")).toBe("240");
      expect(last.get("city")).toBe("Lagos");
    });
  });

  it("lists a category page's own category until a chip in the row replaces it", async () => {
    const seen: URLSearchParams[] = [];
    mockApi((p) => seen.push(p));
    const { result } = renderHookWithProviders(() =>
      useSearchResultsViewModel({ subject: { kind: "category", label: "Boat cruises" }, interest: "boat-cruises" }),
    );

    expect(result.current.heading).toBe("Boat cruises");
    await waitFor(() => expect(seen.at(-1)?.get("interest")).toBe("boat-cruises"));

    act(() => result.current.toggleCategory("local-food-drinks"));
    await waitFor(() => expect(seen.at(-1)?.get("interest")).toBe("local-food-drinks"));
  });

  it("sets a date range with two taps and applies it on Apply", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleDropdown("dates"));
    expect(result.current.openDropdown).toBe("dates");

    act(() => result.current.pickDate(new Date(2030, 10, 12)));
    expect(result.current.draftRange.end).toBeNull();
    // Nothing is applied until Apply.
    expect(result.current.filters.dateRange.start).toBeNull();

    act(() => result.current.pickDate(new Date(2030, 10, 21)));
    expect(result.current.draftRange).toEqual({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) });

    act(() => result.current.applyDates());
    expect(result.current.filters.dateRange).toEqual({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) });
    expect(result.current.openDropdown).toBeNull();
    expect(result.current.filterCount).toBe(1);
  });

  it("treats the same date twice as one day and an earlier second tap as a new start", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.pickDate(new Date(2030, 10, 12)));
    act(() => result.current.pickDate(new Date(2030, 10, 12)));
    expect(result.current.draftRange).toEqual({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 12) });

    act(() => result.current.pickDate(new Date(2030, 10, 20)));
    act(() => result.current.pickDate(new Date(2030, 10, 15)));
    expect(result.current.draftRange).toEqual({ start: new Date(2030, 10, 15), end: null });
  });

  it("toggles single-choice filters, multi-choice languages and generic chip groups", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleOption("timeOfDay", "evening"));
    expect(result.current.filters.timeOfDay).toBe("evening");
    act(() => result.current.toggleOption("timeOfDay", "evening"));
    expect(result.current.filters.timeOfDay).toBeNull();

    act(() => result.current.toggleOption("languages", "English"));
    act(() => result.current.toggleOption("languages", "Igbo"));
    expect(result.current.filters.languages).toEqual(["English", "Igbo"]);

    act(() => result.current.toggleOption("area", "Lekki"));
    expect(result.current.filters.groups.area).toEqual(["Lekki"]);
    act(() => result.current.toggleOption("area", "Lekki"));
    expect(result.current.filters.groups.area).toEqual([]);
  });

  it("choosing a type shows its filters; clearing it removes them and says so", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleType("experiences"));
    expect(result.current.panel.typeSection?.title).toBe("Experiences");
    expect(result.current.footerLabel).toBe("Show results");

    act(() => result.current.toggleOption("duration", "half_day"));
    act(() => result.current.toggleOption("languages", "Yoruba"));
    act(() => result.current.setGroupSize(4));
    expect(result.current.filterCount).toBe(4);

    act(() => result.current.clearChip("type"));
    expect(result.current.filters.types).toEqual([]);
    expect(result.current.filters.duration).toBeNull();
    expect(result.current.filters.languages).toEqual([]);
    expect(result.current.filters.groupSize).toBe(1);
    expect(result.current.clearedNote).toBe(3);
    expect(result.current.panel.typeSection).toBeNull();

    // The note goes away with the next change.
    act(() => result.current.toggleOption("area", "Yaba"));
    expect(result.current.clearedNote).toBeNull();
  });

  it("sets flags and keeps the group size between 1 and 50", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleType("events"));
    act(() => result.current.setFlag("studentDiscount", true));
    expect(result.current.filterCount).toBe(2);
    act(() => result.current.setGroupSize(0));
    expect(result.current.filters.groupSize).toBe(1);
    act(() => result.current.setGroupSize(99));
    expect(result.current.filters.groupSize).toBe(50);
  });

  it("clears every filter at once", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleCategory("local-food-drinks"));
    act(() => result.current.setPrice({ min: null, max: 10000 }));
    act(() => result.current.toggleOption("timeOfDay", "morning"));
    expect(result.current.filterCount).toBe(3);

    act(() => result.current.clearAll());
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filters.price.max).toBeNull();
  });

  it("applies the featured picks and shows price and dates in the row", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleUnder15k());
    expect(result.current.panel.featured.find((f) => f.id === "under15k")?.selected).toBe(true);
    expect(result.current.rowChips.find((c) => c.kind === "active" && c.id === "price")).toMatchObject({ label: "Under ₦15,000" });
    act(() => result.current.toggleUnder15k());
    expect(result.current.filterCount).toBe(0);

    act(() => result.current.toggleFree());
    expect(result.current.filters.free).toBe(true);
    expect(result.current.rowChips.find((c) => c.kind === "active" && c.id === "price")).toMatchObject({ label: "Free" });

    act(() => result.current.pickThisWeekend());
    expect(result.current.panel.featured.find((f) => f.id === "weekend")?.selected).toBe(true);
    act(() => result.current.pickThisWeekend());
    expect(result.current.filters.dateRange.start).toBeNull();

    act(() => result.current.pickTonight());
    expect(result.current.panel.featured.find((f) => f.id === "tonight")?.selected).toBe(true);
  });

  it("without the quiz: no subcategories and no quiz chip in the row, the prompt stays in the panel", () => {
    mockApi();
    const { result } = setup("guest");

    act(() => result.current.toggleCategory("local-food-drinks"));
    expect(result.current.rowChips.some((c) => c.kind === "subcategory")).toBe(false);
    expect(result.current.rowChips.map((c) => c.kind)).not.toContain("unlock");
    expect(result.current.panel.showQuizPrompt).toBe(true);
    expect(result.current.quizHref).toBe("/onboarding");
  });

  it("with the quiz: subcategories are the row's filters and are picked on their own", () => {
    mockApi();
    const { result } = setup("taken");

    expect(result.current.rowChips.some((c) => c.kind === "category")).toBe(false);
    act(() => result.current.toggleSubcategory("cafes-coffee-culture"));
    expect(result.current.filters.subcategories).toEqual(["cafes-coffee-culture"]);
    expect(result.current.filters.categories).toEqual([]);
    expect(result.current.rowChips[0]).toMatchObject({ kind: "subcategory", slug: "cafes-coffee-culture", selected: true });
    expect(result.current.filterCount).toBe(1);

    // A category picked in the panel doesn't tie the subcategory to it.
    act(() => result.current.toggleCategory("local-food-drinks"));
    act(() => result.current.toggleCategory("local-food-drinks"));
    expect(result.current.filters.subcategories).toEqual(["cafes-coffee-culture"]);

    act(() => result.current.toggleSubcategory("cafes-coffee-culture"));
    expect(result.current.filters.subcategories).toEqual([]);
  });

  it("picks the quiz taker's own categories with Picked for your taste", () => {
    mockApi();
    const { result } = setup("taken");

    act(() => result.current.togglePickedForYou());
    expect(result.current.filters.categories).toHaveLength(5);
    expect(result.current.panel.featured[0].selected).toBe(true);

    act(() => result.current.togglePickedForYou());
    expect(result.current.filters.categories).toEqual([]);
  });

  it("opens and closes the filters panel, closing any dropdown first", () => {
    mockApi();
    const { result } = setup();

    act(() => result.current.toggleDropdown("dates"));
    act(() => result.current.openPanel());
    expect(result.current.panelOpen).toBe(true);
    expect(result.current.openDropdown).toBeNull();

    act(() => result.current.closePanel());
    expect(result.current.panelOpen).toBe(false);
  });

  it("starts from the dates in the results link and asks for that day", async () => {
    const calls: URLSearchParams[] = [];
    mockApi((params) => calls.push(params));
    audience = "guest";
    const { result } = renderHookWithProviders(() =>
      useSearchResultsViewModel({ subject: { kind: "city", label: "Lagos" }, city: "Lagos", date: "2030-06-01" }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(calls.at(-1)?.get("date")).toBe("2030-06-01");
    expect(result.current.filters.dateRange.start).toEqual(new Date(2030, 5, 1));
    expect(result.current.filterCount).toBe(1);
  });

  it("follows new dates in the link while the page stays open", async () => {
    mockApi();
    audience = "guest";
    const { result, rerender } = renderHookWithProviders(
      ({ date }: { date: string }) =>
        useSearchResultsViewModel({ subject: { kind: "city", label: "Lagos" }, city: "Lagos", date }),
      { initialProps: { date: "2030-06-01" } },
    );

    rerender({ date: "2030-07-09" });
    await waitFor(() => expect(result.current.filters.dateRange.start).toEqual(new Date(2030, 6, 9)));
  });

  it("gives the API's reason when the listing fails, and isn't empty", async () => {
    server.use(
      http.get(apiUrl("/experiences/filter"), () =>
        HttpResponse.json({ detail: "Pick today or a later date." }, { status: 400 }),
      ),
    );
    const { result } = setup();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorMessage).toBe("Pick today or a later date.");
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.countLabel).toBe("(Failed to load)");
  });
});
