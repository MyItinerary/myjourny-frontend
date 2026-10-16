import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { CategoryResultsGrid } from "./category-results-grid";
import type { ExperienceItem } from "@/lib/mock-data/home";

vi.mock("@/features/taste-quiz-cta", () => ({
  TasteQuizCtaView: () => null,
  useTasteQuizCtaViewModel: () => ({ isVisible: false, onDismiss: vi.fn() }),
}));

vi.mock("@/components/experiences/experience-card-vertical", () => ({
  ExperienceCardVertical: ({ title }: { title: string }) => (
    <div data-testid="experience-card">{title}</div>
  ),
}));

const mockItems: ExperienceItem[] = [
  {
    id: "exp-1",
    title: "Surfing in Tarkwa Bay",
    category: "Beaches",
    imageAlt: "Surfing",
    imageSrc: "/images/surf.jpg",
    rating: 4.8,
    reviewCount: 12,
    priceFrom: 15000,
    currency: "NGN",
    duration: "3 hours",
  },
];

describe("CategoryResultsGrid", () => {
  it("maintains skeleton loaders while isLoading is true and items are empty", () => {
    const { container } = renderWithProviders(
      <CategoryResultsGrid items={[]} categoryLabel="Beaches & waterfronts" isLoading={true} />
    );

    // Should not show empty state
    expect(screen.queryByText(/No experiences found/i)).not.toBeInTheDocument();
    // 16 skeletons rendered
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("handles failed requests with an error message rather than empty state", async () => {
    const handleRetry = vi.fn();
    const { user } = renderWithProviders(
      <CategoryResultsGrid
        items={[]}
        categoryLabel="Beaches & waterfronts"
        isLoading={false}
        isError={true}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText("Failed to load experiences")).toBeInTheDocument();
    expect(
      screen.getByText(/We couldn't load experiences at this moment/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/No experiences found/i)).not.toBeInTheDocument();

    const retryButton = screen.getByRole("button", { name: "Try again" });
    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledOnce();
  });

  it("displays empty state only when completed fetch genuinely returns 0 results", () => {
    renderWithProviders(
      <CategoryResultsGrid
        items={[]}
        categoryLabel="Rare Category"
        isLoading={false}
        isError={false}
      />
    );

    expect(screen.getByText("No experiences found in Rare Category")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load experiences")).not.toBeInTheDocument();
  });

  it("renders experience cards when items are provided and not loading", () => {
    renderWithProviders(
      <CategoryResultsGrid
        items={mockItems}
        categoryLabel="Beaches"
        isLoading={false}
        isError={false}
      />
    );

    expect(screen.getByText("Surfing in Tarkwa Bay")).toBeInTheDocument();
    expect(screen.queryByText(/No experiences found/i)).not.toBeInTheDocument();
  });

  it("maintains the loaded cards and provides a retry button when load-more fails", async () => {
    const handleLoadMore = vi.fn();
    const { user } = renderWithProviders(
      <CategoryResultsGrid
        items={mockItems}
        categoryLabel="Beaches"
        isLoading={false}
        isError={true}
        loadMore={{
          hasMore: true,
          isLoading: false,
          isError: true,
          onLoadMore: handleLoadMore,
        }}
      />
    );

    // Existing cards are preserved
    expect(screen.getByText("Surfing in Tarkwa Bay")).toBeInTheDocument();
    // Full error container is NOT shown
    expect(screen.queryByText("Failed to load experiences")).not.toBeInTheDocument();

    // Retry load more button is shown
    const retryButton = screen.getByRole("button", { name: "Retry loading more" });
    expect(retryButton).toBeInTheDocument();
    expect(screen.getByText("Couldn't load more experiences. Tap to retry.")).toBeInTheDocument();

    await user.click(retryButton);
    expect(handleLoadMore).toHaveBeenCalledOnce();
  });
});
