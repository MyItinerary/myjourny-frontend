import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useEventsPageViewModel } from "./use-events-page-view-model";

const audience = vi.hoisted(() => ({ value: "taken" as string }));
vi.mock("@/features/taste-quiz-cta", () => ({ useTasteQuizAudience: () => audience.value }));
const searchedArea = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("@/features/search", () => ({ useLastSearchArea: () => searchedArea.value }));
vi.mock("@/features/home", () => ({ useHomeHeroViewModel: () => ({}) }));
const categoryData = vi.hoisted(() => ({ value: undefined as unknown[] | undefined }));
vi.mock("@/lib/queries/categories", () => ({
  useInterestCategories: () => ({
    data: categoryData.value ?? [
      { id: 1, slug: "music", text: "Music", parent_id: null },
      { id: 2, slug: "jazz", text: "Jazz", parent_id: 1 },
    ],
  }),
}));

describe("useEventsPageViewModel", () => {
  it("serves the placeholder event rails", () => {
    const { result } = renderHookWithProviders(() => useEventsPageViewModel());

    expect(result.current.popularToday.length).toBeGreaterThan(0);
    expect(result.current.thisWeekend.length).toBeGreaterThan(0);
    expect(result.current.earlyBird.length).toBeGreaterThan(0);
    expect(result.current.pickedForYou.length).toBeGreaterThan(0);
    expect(result.current.nextWeek.length).toBeGreaterThan(0);
  });

  it("leaves out 'Picked for your taste' until the quiz is done", () => {
    audience.value = "no-quiz";
    expect(renderHookWithProviders(() => useEventsPageViewModel()).result.current.pickedForYou).toEqual([]);
    audience.value = "taken";
  });

  it("falls back to the design's category list while the API has none", () => {
    categoryData.value = [];
    const { result } = renderHookWithProviders(() => useEventsPageViewModel());
    categoryData.value = undefined;

    expect(result.current.categories).toHaveLength(9);
    expect(result.current.categories[0]).toMatchObject({ id: "street-food-markets", label: "Street food & markets" });
  });

  it("has no 'Based on your search' rail until an area has been searched, then names the area", () => {
    searchedArea.value = null;
    expect(renderHookWithProviders(() => useEventsPageViewModel()).result.current.basedOnSearch).toBeNull();

    searchedArea.value = "Lekki";
    const { result } = renderHookWithProviders(() => useEventsPageViewModel());
    searchedArea.value = null;
    expect(result.current.basedOnSearch?.area).toBe("Lekki");
    expect(result.current.basedOnSearch?.events.length).toBeGreaterThan(0);
  });

  it("offers top-level categories as pills", () => {
    const { result } = renderHookWithProviders(() => useEventsPageViewModel());

    expect(result.current.categories).toEqual([{ id: "music", label: "Music", iconSrc: undefined }]);
  });
});
