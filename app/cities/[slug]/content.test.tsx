import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { CityContent } from "./content";

const cityQueryState = vi.hoisted(() => ({
  data: undefined as { pages: Array<{ items: unknown[]; total?: number }> } | undefined,
  isPending: false,
  isError: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
  lastFilters: undefined as Record<string, unknown> | undefined,
}));

const searchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => searchParams.current }));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/components/home/experience-rail-section", () => ({ ExperienceRailSection: () => null }));
vi.mock("@/features/taste-quiz-cta", () => ({
  TasteQuizCtaView: () => null,
  useTasteQuizCtaViewModel: () => ({ isVisible: false, onDismiss: vi.fn() }),
}));

vi.mock("@/components/experiences/experience-card-vertical", () => ({
  ExperienceCardVertical: ({ title }: { title: string }) => (
    <div data-testid="experience-card">{title}</div>
  ),
}));

vi.mock("@/lib/auth/session-store", () => ({
  useSession: () => ({ user: null, hydrated: true }),
}));

vi.mock("@/lib/queries/categories", () => ({
  useInterestCategories: () => ({ data: [] }),
}));

vi.mock("@/lib/queries/experiences", () => ({
  useInfiniteFilteredExperiences: (filters: Record<string, unknown>) => {
    cityQueryState.lastFilters = filters;
    return {
      data: cityQueryState.data,
      isPending: cityQueryState.isPending,
      isError: cityQueryState.isError,
      hasNextPage: cityQueryState.hasNextPage,
      isFetchingNextPage: cityQueryState.isFetchingNextPage,
      isFetchNextPageError: cityQueryState.isFetchNextPageError,
      refetch: cityQueryState.refetch,
      fetchNextPage: cityQueryState.fetchNextPage,
    };
  },
  useRecommendedExperiences: () => ({ data: [], isPending: false }),
  useFilteredExperiences: () => ({ data: { items: [] }, isPending: false }),
  experienceListItemToCardProps: (item: {
    id: string;
    title: string;
    category?: string;
    imageSrc?: string;
    rating?: number;
    priceFrom?: number;
  }) => ({
    id: item.id,
    title: item.title,
    category: item.category ?? "Adventure",
    imageAlt: item.title,
    imageSrc: item.imageSrc ?? "/images/kayak.jpg",
    rating: item.rating ?? 4.8,
    reviewCount: 10,
    priceFrom: item.priceFrom ?? 10000,
    currency: "NGN",
    duration: "2 hours",
  }),
  experienceMatchToCardProps: (item: { id: string; title: string }) => ({
    id: item.id,
    title: item.title,
  }),
}));

describe("CityContent", () => {
  it("asks for the day picked in the search bar", () => {
    searchParams.current = new URLSearchParams("date=2030-06-01");
    renderWithProviders(<CityContent cityName="Abuja" />);
    expect(cityQueryState.lastFilters).toMatchObject({ city: "Abuja", date: "2030-06-01" });
    searchParams.current = new URLSearchParams();
  });

  it("displays loading placeholder in title and skeletons in grid while pending", () => {
    cityQueryState.isPending = true;
    cityQueryState.isError = false;
    cityQueryState.data = undefined;

    const { container } = renderWithProviders(<CityContent cityName="Lagos" country="Nigeria" />);

    expect(screen.getByText("(Loading experiences…)")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/No experiences found/i)).not.toBeInTheDocument();
  });

  it("displays error placeholder and retry button when initial request fails", async () => {
    const handleRefetch = vi.fn();
    cityQueryState.isPending = false;
    cityQueryState.isError = true;
    cityQueryState.data = undefined;
    cityQueryState.refetch = handleRefetch;

    const { user } = renderWithProviders(<CityContent cityName="Lagos" country="Nigeria" />);

    expect(screen.getByText("(Failed to load)")).toBeInTheDocument();
    expect(screen.getByText("Failed to load experiences")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: "Try again" });
    await user.click(retryBtn);
    expect(handleRefetch).toHaveBeenCalledOnce();
  });

  it("retains loaded items and displays retry button when load-more fails", async () => {
    const handleFetchNextPage = vi.fn();
    cityQueryState.isPending = false;
    cityQueryState.isError = true;
    cityQueryState.isFetchNextPageError = true;
    cityQueryState.hasNextPage = true;
    cityQueryState.fetchNextPage = handleFetchNextPage;
    cityQueryState.data = {
      pages: [
        {
          items: [{ id: "exp-1", title: "Lekki Conservation Walk", priceFrom: 12000 }],
          total: 10,
        },
      ],
    };

    const { user } = renderWithProviders(<CityContent cityName="Lagos" country="Nigeria" />);

    expect(screen.getByText("Lekki Conservation Walk")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load experiences")).not.toBeInTheDocument();

    const retryMoreBtn = screen.getByRole("button", { name: "Retry loading more" });
    expect(retryMoreBtn).toBeInTheDocument();
    expect(screen.getByText("Couldn't load more experiences. Tap to retry.")).toBeInTheDocument();

    await user.click(retryMoreBtn);
    expect(handleFetchNextPage).toHaveBeenCalledOnce();
  });

  it("renders cards and result count when data is successfully loaded", () => {
    cityQueryState.isPending = false;
    cityQueryState.isError = false;
    cityQueryState.isFetchNextPageError = false;
    cityQueryState.hasNextPage = false;
    cityQueryState.data = {
      pages: [
        {
          items: [{ id: "exp-1", title: "Lekki Conservation Walk", priceFrom: 12000 }],
          total: 1,
        },
      ],
    };

    renderWithProviders(<CityContent cityName="Lagos" country="Nigeria" />);

    expect(screen.getByText("Lekki Conservation Walk")).toBeInTheDocument();
    expect(screen.getByText("(1 result)")).toBeInTheDocument();
  });
});
