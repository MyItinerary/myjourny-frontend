import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useHomeViewModel } from "./use-home-view-model";

const session = vi.hoisted(() => ({ user: null as null | { id: string }, hydrated: true }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session }));
vi.mock("@/lib/hooks/use-geolocation", () => ({ useGeolocation: () => "unavailable" }));
vi.mock("@/features/mobile-nav", () => ({ openMobileSearch: vi.fn() }));
const searchedArea = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("@/features/search", () => ({
  useSearchBarViewModel: () => ({}),
  useLastSearchArea: () => searchedArea.value,
}));
vi.mock("@/features/cities", () => ({ useDiscoverCitiesViewModel: () => ({ cities: [], show: false }) }));
const audience = vi.hoisted(() => ({ value: "guest" as string }));
vi.mock("@/features/taste-quiz-cta", () => ({
  useTasteQuizCtaViewModel: () => ({ visible: true, href: "/onboarding" }),
  useTasteQuizAudience: () => audience.value,
}));

const experience = { id: "exp-1", title: "Kayaking" };
const guestList = vi.hoisted(() => ({ query: { data: { items: [] as unknown[] }, isPending: false } }));
const recommended = vi.hoisted(() => ({ query: { data: [] as unknown[], isFetching: false } }));
vi.mock("@/lib/queries/experiences", () => ({
  useFilteredExperiences: () => guestList.query,
  useRecommendedExperiences: () => recommended.query,
  useBrowsingHistory: () => ({ data: [experience], isFetching: false }),
  experienceListItemToCardProps: (item: { id: string; title: string }) => ({ id: item.id, title: item.title }),
  experienceMatchToCardProps: (item: { id: string; title: string }) => ({ id: item.id, title: item.title }),
}));

describe("useHomeViewModel", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("leaves out the event rails, Tonight and Early bird, while events are off", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    session.user = null;
    guestList.query = { data: { items: [experience] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.tonightAndThisWeekend.show).toBe(false);
    expect(result.current.earlyBird.show).toBe(false);
  });

  it("gives guests rails from the public listing, no pick-up rail, and the placeholder rails", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    session.user = null;
    guestList.query = { data: { items: [experience] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.pickedForYou.show).toBe(false);
    expect(result.current.newOnMyJourny.items).toHaveLength(1);
    expect(result.current.pickUp.show).toBe(false);
    expect(result.current.tonightAndThisWeekend.items.length).toBeGreaterThan(0);
    expect(result.current.localFoodAndDrinks.items.length).toBeGreaterThan(0);
    expect(result.current.earlyBird.items.length).toBeGreaterThan(0);
    expect(result.current.unforgettableTravel.items.length).toBeGreaterThan(0);
  });

  it("leaves a rail out once it has loaded with nothing", () => {
    session.user = null;
    guestList.query = { data: { items: [] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.newOnMyJourny.show).toBe(false);
  });

  it("shows 'Based on your search in {area}' as soon as an area has been searched", () => {
    session.user = null;
    searchedArea.value = "Lekki";
    guestList.query = { data: { items: [experience] }, isPending: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());
    searchedArea.value = null;

    expect(result.current.basedOnSearch).toMatchObject({ area: "Lekki", show: true });
    expect(result.current.basedOnSearch.items).toHaveLength(1);
  });

  it("leaves 'Based on your search' out until an area has been searched", () => {
    session.user = null;
    searchedArea.value = null;

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.basedOnSearch).toMatchObject({ area: null, show: false });
  });

  it("keeps a rail while it loads", () => {
    session.user = null;
    guestList.query = { data: undefined as never, isPending: true };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.newOnMyJourny).toMatchObject({ isLoading: true, show: true });
  });

  it("shows signed-in users their browsing history to pick up from", () => {
    session.user = { id: "u1" };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.pickUp.items).toHaveLength(1);
  });

  it("gives signed-in users who did the quiz recommendations as 'Picked for your taste'", () => {
    session.user = { id: "u1" };
    audience.value = "taken";
    recommended.query = { data: [experience], isFetching: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.pickedForYou.items).toHaveLength(1);
  });

  it.each(["guest", "no-quiz", "hidden"])("hides 'Picked for your taste' while the quiz audience is %s", (value) => {
    session.user = { id: "u1" };
    audience.value = value;
    recommended.query = { data: [experience], isFetching: false };

    const { result } = renderHookWithProviders(() => useHomeViewModel());

    expect(result.current.pickedForYou.show).toBe(false);
  });
});
