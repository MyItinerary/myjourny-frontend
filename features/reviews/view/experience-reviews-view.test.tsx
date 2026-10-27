import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceReviewsViewModel, ReviewCard } from "../view-model/use-experience-reviews-view-model";
import { ExperienceReviewsView } from "./experience-reviews-view";

const card = (overrides: Partial<ReviewCard> = {}): ReviewCard => ({
  id: "a",
  author: "Ireti G.",
  avatarUrl: null,
  initials: "IG",
  tone: "sand",
  rating: 5,
  comment: "Loved it",
  date: "October 2026",
  verified: true,
  hostReply: null,
  long: false,
  clamped: false,
  helpfulCount: 0,
  voted: false,
  canVote: true,
  ...overrides,
});

function vm(overrides: Partial<ExperienceReviewsViewModel> = {}): ExperienceReviewsViewModel {
  return {
    display: "populated",
    rating: "4.5",
    countLabel: "8 reviews",
    breakdown: [{ label: "Host", value: "4.9", width: "98%" }],
    summary: "Guests loved the breakfast.",
    reviews: [card(), card({ id: "b", author: "Tunde O.", initials: "TO", rating: 4, comment: null })],
    query: "",
    onQueryChange: vi.fn(),
    onClearQuery: vi.fn(),
    sort: "relevant",
    sortLabel: "Most relevant",
    sortOptions: [
      { value: "relevant", label: "Most relevant" },
      { value: "newest", label: "Newest" },
    ],
    sortOpen: false,
    onToggleSort: vi.fn(),
    onCloseSort: vi.fn(),
    onSortChange: vi.fn(),
    filterOpen: false,
    onToggleFilter: vi.fn(),
    ratingFilter: null,
    onRatingFilter: vi.fn(),
    activeFilterCount: 0,
    onClearFilters: vi.fn(),
    onToggleHelpful: vi.fn(),
    onToggleExpanded: vi.fn(),
    hasMore: false,
    loadingMore: false,
    moreLabel: "Show 6 more reviews",
    onShowMore: vi.fn(),
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe("ExperienceReviewsView", () => {
  it("shows the score, the summary and each review", () => {
    renderWithProviders(<ExperienceReviewsView {...vm()} />);
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
    expect(screen.getByText("From 8 reviews")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
    expect(screen.getByText("Guests loved the breakfast.")).toBeInTheDocument();
    expect(screen.getByText("Ireti G.")).toBeInTheDocument();
    expect(screen.getByText("Loved it")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument();
  });

  it("tells a new listing there are no reviews yet", () => {
    renderWithProviders(
      <ExperienceReviewsView {...vm({ display: "new", rating: null, countLabel: null, reviews: [], summary: null })} />,
    );
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search reviews" })).not.toBeInTheDocument();
  });

  it("explains early reviews", () => {
    renderWithProviders(<ExperienceReviewsView {...vm({ display: "early" })} />);
    expect(screen.getByText("Early reviews")).toBeInTheDocument();
  });

  it("shows skeleton rows while loading", () => {
    renderWithProviders(<ExperienceReviewsView {...vm({ display: "loading", rating: null, reviews: [] })} />);
    expect(screen.getByLabelText("Loading reviews")).toBeInTheDocument();
  });

  it("offers a retry on error", async () => {
    const onRetry = vi.fn();
    renderWithProviders(<ExperienceReviewsView {...vm({ display: "error", reviews: [], onRetry })} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("offers to clear when nothing matches", async () => {
    const onClearFilters = vi.fn();
    renderWithProviders(<ExperienceReviewsView {...vm({ display: "noResults", reviews: [], onClearFilters })} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear search and filters" }));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it("loads more reviews on request", async () => {
    const onShowMore = vi.fn();
    renderWithProviders(<ExperienceReviewsView {...vm({ hasMore: true, onShowMore })} />);
    await userEvent.click(screen.getByRole("button", { name: "Show 6 more reviews" }));
    expect(onShowMore).toHaveBeenCalled();
  });

  describe("toolbar", () => {
    it("types into search and clears it", async () => {
      const onQueryChange = vi.fn();
      const onClearQuery = vi.fn();
      renderWithProviders(<ExperienceReviewsView {...vm({ query: "kay", onQueryChange, onClearQuery })} />);
      await userEvent.type(screen.getByRole("textbox", { name: "Search reviews" }), "a");
      expect(onQueryChange).toHaveBeenCalledWith("kaya");
      await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
      expect(onClearQuery).toHaveBeenCalled();
    });

    it("opens the sort menu and picks an option", async () => {
      const onToggleSort = vi.fn();
      const onSortChange = vi.fn();
      const { rerender } = renderWithProviders(<ExperienceReviewsView {...vm({ onToggleSort })} />);
      await userEvent.click(screen.getByRole("button", { name: /Most relevant/ }));
      expect(onToggleSort).toHaveBeenCalled();
      rerender(<ExperienceReviewsView {...vm({ sortOpen: true, onSortChange })} />);
      await userEvent.click(within(screen.getByRole("menu")).getByRole("menuitemradio", { name: "Newest" }));
      expect(onSortChange).toHaveBeenCalledWith("newest");
    });

    it("picks a star filter and shows the active one", async () => {
      const onRatingFilter = vi.fn();
      const { rerender } = renderWithProviders(<ExperienceReviewsView {...vm({ filterOpen: true, onRatingFilter })} />);
      await userEvent.click(screen.getByRole("button", { name: "4 stars" }));
      expect(onRatingFilter).toHaveBeenCalledWith(4);
      rerender(<ExperienceReviewsView {...vm({ ratingFilter: 4, activeFilterCount: 1, onRatingFilter })} />);
      expect(screen.getByRole("button", { name: "Filter · 1" })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: "Remove 4 star filter" }));
      expect(onRatingFilter).toHaveBeenLastCalledWith(null);
    });
  });

  describe("review row", () => {
    it("votes helpful and shows the count", async () => {
      const onToggleHelpful = vi.fn();
      const { rerender } = renderWithProviders(<ExperienceReviewsView {...vm({ onToggleHelpful })} />);
      await userEvent.click(screen.getAllByRole("button", { name: "Was this helpful?" })[0]);
      expect(onToggleHelpful).toHaveBeenCalledWith("a");
      rerender(<ExperienceReviewsView {...vm({ reviews: [card({ voted: true, helpfulCount: 8 })] })} />);
      expect(screen.getByRole("button", { name: "Helpful · 8" })).toHaveAttribute("aria-pressed", "true");
    });

    it("toggles Read more on a long review", async () => {
      const onToggleExpanded = vi.fn();
      const { rerender } = renderWithProviders(
        <ExperienceReviewsView {...vm({ reviews: [card({ long: true, clamped: true })], onToggleExpanded })} />,
      );
      await userEvent.click(screen.getByRole("button", { name: "Read more" }));
      expect(onToggleExpanded).toHaveBeenCalledWith("a");
      rerender(<ExperienceReviewsView {...vm({ reviews: [card({ long: true, clamped: false })] })} />);
      expect(screen.getByRole("button", { name: "Read less" })).toBeInTheDocument();
    });

    it("shows the host's reply and the verified badge", () => {
      renderWithProviders(
        <ExperienceReviewsView
          {...vm({ reviews: [card({ hostReply: { author: "Tunde, host", text: "Thank you!", initials: "T" } })] })}
        />,
      );
      expect(screen.getByText("Reply from Tunde, host")).toBeInTheDocument();
      expect(screen.getByText("Thank you!")).toBeInTheDocument();
      expect(screen.getByText("Verified booking")).toBeInTheDocument();
    });
  });
});
