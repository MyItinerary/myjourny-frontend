import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useHomeViewModel } from "./use-home-view-model";

const session = vi.hoisted(() => ({ user: null as null | { id: string }, hydrated: true }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));
vi.mock("@/lib/hooks/use-geolocation", () => ({ useGeolocation: () => "unavailable" }));
vi.mock("@/features/mobile-nav", () => ({ openMobileSearch: vi.fn() }));
vi.mock("@/features/search", () => ({ useSearchBarViewModel: () => ({}) }));
vi.mock("@/features/cities", () => ({ useDiscoverCitiesViewModel: () => ({ cities: [], show: false }) }));
vi.mock("@/features/taste-quiz-cta", () => ({
  useTasteQuizCtaViewModel: () => ({ visible: true, href: "/onboarding" }),
}));

const experience = { id: "exp-1", title: "Kayaking" };
const guestList = vi.hoisted(() => ({ query: { data: { items: [] as unknown[] }, isPending: false } }));
const recommended = vi.hoisted(() => ({ query: { data: [] as unknown[], isFetching: false } }));
vi.mock("@/lib/queries/experiences", () => ({
  useFilteredExperiences: () => guestList.query,
  useRecommendedExperiences: () => recommended.query,
  useBrowsingHistory: () => ({ data: [], isFetching: false }),
  experienceListItemToCardProps: (item: { id: string; title: string }) => ({ id: item.id, title: item.title }),
  experienceMatchToCardProps: (item: { id: string; title: string }) => ({ id: item.id, title: item.title }),
}));

describe("useHomeViewModel", () => {
  it("gives guests rails from the public listing, no browsing history, and the placeholder rails", () => {
    session.user = null;
    guestList.query = { data: { items: [experience] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.happeningNear.items).toHaveLength(1);
    expect(result.current.topPicks.items).toHaveLength(1);
    expect(result.current.browsingHistory.show).toBe(false);
    expect(result.current.popularEvents.items.length).toBeGreaterThan(0);
    expect(result.current.localFoodAndDrinks.items.length).toBeGreaterThan(0);
    expect(result.current.unforgettableTravel.items.length).toBeGreaterThan(0);
    expect(result.current.exploreLagos.items).toHaveLength(1);
    expect(result.current.cultureAndHistory.items).toHaveLength(1);
  });

  it("leaves a rail out once it has loaded with nothing", () => {
    session.user = null;
    guestList.query = { data: { items: [] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.happeningNear.show).toBe(false);
  });

  it("keeps a rail while it loads", () => {
    session.user = null;
    guestList.query = { data: undefined as never, isPending: true };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.happeningNear).toMatchObject({ isLoading: true, show: true });
  });

  it("gives signed-in users recommendations", () => {
    session.user = { id: "u1" };
    recommended.query = { data: [experience], isFetching: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.happeningNear.items).toHaveLength(1);
    expect(result.current.topPicks.items).toHaveLength(1);
  });
});
