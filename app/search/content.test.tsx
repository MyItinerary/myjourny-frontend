import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { SearchContent } from "./content";

const searchState = vi.hoisted(() => ({
  data: [] as unknown[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

const navState = vi.hoisted(() => ({
  query: "kayak",
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navState.push, replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navState.query ? `q=${navState.query}` : ""),
  usePathname: () => "/search",
}));

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav data-testid="home-nav" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/features/taste-quiz-cta", () => ({
  TasteQuizCtaView: () => null,
  useTasteQuizCtaViewModel: () => ({ isVisible: false, onDismiss: vi.fn() }),
}));

vi.mock("@/lib/queries/experiences", () => ({
  useSemanticSearch: () => ({
    data: searchState.data,
    isLoading: searchState.isLoading,
    isError: searchState.isError,
    refetch: searchState.refetch,
  }),
  formatDuration: (d: number | null) => `${d} hours`,
}));

vi.mock("@/components/experiences/experience-card-vertical", () => ({
  ExperienceCardVertical: ({ title }: { title: string }) => (
    <div data-testid="experience-card">{title}</div>
  ),
}));

describe("SearchContent", () => {
  it("shows loading message and skeleton loaders while search is pending", () => {
    searchState.isLoading = true;
    searchState.isError = false;
    searchState.data = [];

    const { container } = renderWithProviders(<SearchContent />);

    expect(screen.getByText("Loading experiences…")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText(/No matching experiences found/i)).not.toBeInTheDocument();
  });

  it("shows error state and retries search on 'Try again' click", async () => {
    const handleRefetch = vi.fn();
    searchState.isLoading = false;
    searchState.isError = true;
    searchState.data = [];
    searchState.refetch = handleRefetch;

    const { user } = renderWithProviders(<SearchContent />);

    expect(screen.getByText("Failed to load experiences")).toBeInTheDocument();
    expect(screen.getByText("Failed to load search results")).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't complete your search at this moment/i)
    ).toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "Try again" });
    await user.click(retryButton);
    expect(handleRefetch).toHaveBeenCalledOnce();
  });

  it("renders empty state when search returns zero results", () => {
    searchState.isLoading = false;
    searchState.isError = false;
    searchState.data = [];

    renderWithProviders(<SearchContent />);

    expect(screen.getByText("No matching experiences found")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load search results")).not.toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "P" && !!el?.textContent?.includes("Found 0 experiences"))).toBeInTheDocument();
  });

  it("renders experiences cards when search succeeds with results", () => {
    searchState.isLoading = false;
    searchState.isError = false;
    searchState.data = [
      {
        experience_id: "exp-1",
        title: "Tarkwa Bay Kayaking",
        city: "Lagos",
        duration: 2,
        rating: 4.9,
        price_from: 20000,
        currency: "NGN",
      },
    ];

    renderWithProviders(<SearchContent />);

    expect(screen.getByText("Tarkwa Bay Kayaking")).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "P" && !!el?.textContent?.includes("Found 1 experience"))).toBeInTheDocument();
    expect(screen.queryByText("No matching experiences found")).not.toBeInTheDocument();
  });
});
