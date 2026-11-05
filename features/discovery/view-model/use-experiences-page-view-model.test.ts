import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useExperiencesPageViewModel } from "./use-experiences-page-view-model";

const session = vi.hoisted(() => ({ user: null as null | { id: string }, hydrated: true }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));
vi.mock("@/lib/hooks/use-geolocation", () => ({ useGeolocation: () => "unavailable" }));
const audience = vi.hoisted(() => ({ value: "guest" as string }));
vi.mock("@/features/taste-quiz-cta", () => ({ useTasteQuizAudience: () => audience.value }));
const searchedArea = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("@/features/search", () => ({ useLastSearchArea: () => searchedArea.value }));
vi.mock("@/features/home", () => ({ useHomeHeroViewModel: () => ({}) }));
vi.mock("@/features/cities", () => ({ useDiscoverCitiesViewModel: () => ({ cities: [], show: false }) }));
const categoryData = vi.hoisted(() => ({ value: undefined as unknown[] | undefined }));
vi.mock("@/lib/queries/categories", () => ({
  useInterestCategories: () => ({
    data: categoryData.value ?? [
      { id: 1, slug: "food", text: "Food", parent_id: null },
      { id: 3, slug: "local-food-drinks", text: "Local food & drinks", parent_id: null },
      { id: 2, slug: "cafes", text: "Cafés", parent_id: 1 },
    ],
  }),
}));

const list = vi.hoisted(() => ({ query: { data: { items: [] as unknown[] }, isPending: false }, calls: [] as unknown[] }));
vi.mock("@/lib/queries/experiences", () => ({
  useFilteredExperiences: (filters: unknown) => {
    list.calls.push(filters);
    return list.query;
  },
  useRecommendedExperiences: () => ({ data: [{ id: "r1", title: "Rec" }], isFetching: false }),
  useBrowsingHistory: () => ({ data: [{ id: "h1", title: "Seen" }], isFetching: false }),
  experienceListItemToCardProps: (i: { id: string; title: string }) => ({ id: i.id, title: i.title }),
  experienceMatchToCardProps: (i: { id: string; title: string }) => ({ id: i.id, title: i.title }),
}));

describe("useExperiencesPageViewModel", () => {
  it("gives guests public rails, no pick-up rail, and top-level categories as pills", () => {
    session.user = null;
    list.query = { data: { items: [{ id: "e1", title: "Kayaking" }] }, isPending: false };

    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());

    expect(result.current.pickUp.show).toBe(false);
    expect(result.current.nearYouInLagos.items).toHaveLength(1);
    expect(result.current.categories).toEqual([
      { id: "food", label: "Food", iconSrc: undefined },
      { id: "local-food-drinks", label: "Local food & drinks", iconSrc: "/images/discovery/local-food-drinks.png" },
    ]);
  });

  it("shows 'Based on your search in {area}' as soon as an area has been searched", () => {
    session.user = null;
    searchedArea.value = "Lekki";
    list.query = { data: { items: [{ id: "e1", title: "Kayaking" }] }, isPending: false };
    list.calls = [];

    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());
    searchedArea.value = null;

    expect(result.current.basedOnSearch).toMatchObject({ area: "Lekki", show: true });
    expect(result.current.basedOnSearch.items).toHaveLength(1);
    expect(list.calls).toContainEqual(expect.objectContaining({ search: "Lekki" }));
  });

  it("leaves 'Based on your search' out until an area has been searched", () => {
    session.user = null;
    searchedArea.value = null;

    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());

    expect(result.current.basedOnSearch).toMatchObject({ area: null, show: false });
  });

  it("falls back to the default categories while the API has none", () => {
    categoryData.value = [];
    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());
    categoryData.value = undefined;

    expect(result.current.categories).toHaveLength(7);
    expect(result.current.categories[0]).toMatchObject({ id: "local-food-drinks", label: "Local food & drinks" });
  });

  it("asks for experiences available on the coming Saturday", () => {
    session.user = null;
    list.calls = [];
    renderHookWithProviders(() => useExperiencesPageViewModel());

    expect(list.calls).toContainEqual(expect.objectContaining({ date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
    expect(list.calls).toContainEqual(expect.objectContaining({ city: "Lagos" }));
  });

  it("hides 'Picked for your taste' until the quiz is done", () => {
    session.user = { id: "u1" };
    audience.value = "no-quiz";

    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());

    expect(result.current.pickedForYou.show).toBe(false);
  });

  it("gives signed-in users their history and, once the quiz is done, recommendations", () => {
    session.user = { id: "u1" };
    audience.value = "taken";

    const { result } = renderHookWithProviders(() => useExperiencesPageViewModel());

    expect(result.current.pickUp.items).toEqual([{ id: "h1", title: "Seen" }]);
    expect(result.current.pickedForYou.items).toEqual([{ id: "r1", title: "Rec" }]);
  });

  it("leaves a rail out once it has loaded with nothing, and keeps it while loading", () => {
    session.user = null;
    list.query = { data: { items: [] }, isPending: false };
    expect(renderHookWithProviders(() => useExperiencesPageViewModel()).result.current.nearYouInLagos.show).toBe(false);

    list.query = { data: undefined as never, isPending: true };
    expect(renderHookWithProviders(() => useExperiencesPageViewModel()).result.current.nearYouInLagos).toMatchObject({
      isLoading: true,
      show: true,
    });
  });
});
