import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { PopularExperiencesContent } from "./content";

const queryState = vi.hoisted(() => ({
  data: undefined as { pages: Array<{ items: unknown[]; total?: number }> } | undefined,
  isPending: false,
  isError: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  isFetchNextPageError: false,
  refetch: vi.fn(),
  fetchNextPage: vi.fn(),
}));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
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

vi.mock("@/lib/hooks/use-geolocation", () => ({
  useGeolocation: () => "unavailable",
}));

vi.mock("@/lib/queries/experiences", () => ({
  useInfiniteFilteredExperiences: () => ({
    data: queryState.data,
    isPending: queryState.isPending,
    isError: queryState.isError,
    hasNextPage: queryState.hasNextPage,
    isFetchingNextPage: queryState.isFetchingNextPage,
    isFetchNextPageError: queryState.isFetchNextPageError,
    refetch: queryState.refetch,
    fetchNextPage: queryState.fetchNextPage,
  }),
  useInfiniteRecommendedExperiences: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
  }),
  useFilteredExperiences: () => ({ data: { items: [] }, isPending: false }),
  uniqueMatches: (pages?: Array<{ items: unknown[] }>) => (pages ?? []).flatMap((p) => p.items ?? []),
  experienceMatchToCardProps: (m: { id: string; title: string }) => m,
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
    category: "Popular",
    imageAlt: item.title,
    imageSrc: "/images/kayak.jpg",
    rating: 4.9,
    reviewCount: 20,
    priceFrom: 18000,
    currency: "NGN",
    duration: "2 hours",
  }),
}));

describe("PopularExperiencesContent", () => {
  it("displays loading placeholder in header and skeletons in grid while pending", () => {
    queryState.isPending = true;
    queryState.isError = false;
    queryState.data = undefined;

    const { container } = renderWithProviders(<PopularExperiencesContent />);

    expect(screen.getByText("(Loading experiences…)")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/No experiences found/i)).not.toBeInTheDocument();
  });

  it("displays error placeholder and retry button when initial request fails", async () => {
    const handleRefetch = vi.fn();
    queryState.isPending = false;
    queryState.isError = true;
    queryState.data = undefined;
    queryState.refetch = handleRefetch;

    const { user } = renderWithProviders(<PopularExperiencesContent />);

    expect(screen.getByText("(Failed to load)")).toBeInTheDocument();
    expect(screen.getByText("Failed to load experiences")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: "Try again" });
    await user.click(retryBtn);
    expect(handleRefetch).toHaveBeenCalledOnce();
  });

  it("retains loaded cards and displays retry button when load-more fails", async () => {
    const handleFetchNextPage = vi.fn();
    queryState.isPending = false;
    queryState.isError = true;
    queryState.isFetchNextPageError = true;
    queryState.hasNextPage = true;
    queryState.fetchNextPage = handleFetchNextPage;
    queryState.data = {
      pages: [
        {
          items: [{ id: "exp-1", title: "Sunset Kayak Adventure" }],
          total: 8,
        },
      ],
    };

    const { user } = renderWithProviders(<PopularExperiencesContent />);

    expect(screen.getByText("Sunset Kayak Adventure")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load experiences")).not.toBeInTheDocument();

    const retryMoreBtn = screen.getByRole("button", { name: "Retry loading more" });
    expect(retryMoreBtn).toBeInTheDocument();
    expect(screen.getByText("Couldn't load more experiences. Tap to retry.")).toBeInTheDocument();

    await user.click(retryMoreBtn);
    expect(handleFetchNextPage).toHaveBeenCalledOnce();
  });

  it("renders cards and total count when successfully loaded", () => {
    queryState.isPending = false;
    queryState.isError = false;
    queryState.isFetchNextPageError = false;
    queryState.hasNextPage = false;
    queryState.data = {
      pages: [
        {
          items: [{ id: "exp-1", title: "Sunset Kayak Adventure" }],
          total: 1,
        },
      ],
    };

    renderWithProviders(<PopularExperiencesContent />);

    expect(screen.getByText("Sunset Kayak Adventure")).toBeInTheDocument();
    expect(screen.getByText("(1 result)")).toBeInTheDocument();
  });
});
