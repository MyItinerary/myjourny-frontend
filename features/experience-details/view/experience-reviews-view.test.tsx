import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceReviewsViewModel, ReviewRow } from "../view-model/use-experience-reviews-view-model";
import { ExperienceReviewsView } from "./experience-reviews-view";

const row = (overrides: Partial<ReviewRow> = {}): ReviewRow => ({
  id: "ngozi",
  initials: "NA",
  name: "Ngozi A.",
  date: "August 2026",
  rating: 5,
  text: "Breakfast on the jetty was the surprise.",
  verified: true,
  helpfulCount: 8,
  tone: "sand",
  voted: false,
  ...overrides,
});

function vm(overrides: Partial<ExperienceReviewsViewModel> = {}): ExperienceReviewsViewModel {
  return {
    average: 4.8,
    count: 124,
    breakdown: [
      { label: "Host", value: 4.9 },
      { label: "Value", value: 4.7 },
    ],
    summary: "Guests liked the breakfast.",
    query: "",
    onQueryChange: vi.fn(),
    sort: "relevant",
    onSortChange: vi.fn(),
    ratingFilter: 0,
    onRatingFilterChange: vi.fn(),
    rows: [
      row(),
      row({
        id: "hauwa",
        name: "Hauwa M.",
        rating: 4,
        hostReply: { author: "Reply from your host", initials: "HO", text: "Thank you, Hauwa." },
      }),
    ],
    emptyMessage: null,
    showMoreLabel: "Show 3 more reviews",
    onShowMore: vi.fn(),
    onToggleHelpful: vi.fn(),
    ...overrides,
  };
}

describe("ExperienceReviewsView", () => {
  it("shows the score, breakdown, summary and reviews", () => {
    renderWithProviders(<ExperienceReviewsView {...vm()} />);
    expect(screen.getByRole("heading", { name: "Reviews" })).toBeInTheDocument();
    expect(screen.getByText("124 reviews")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("What people say")).toBeInTheDocument();
    expect(screen.getByText("Ngozi A.")).toBeInTheDocument();
    expect(screen.getByText("Thank you, Hauwa.")).toBeInTheDocument();
    expect(screen.getAllByText("Verified booking")).toHaveLength(2);
  });

  it("searches, sorts and filters", async () => {
    const view = vm();
    const { user } = renderWithProviders(<ExperienceReviewsView {...view} />);
    await user.type(screen.getByRole("searchbox", { name: "Search reviews" }), "j");
    expect(view.onQueryChange).toHaveBeenCalledWith("j");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort reviews" }), "highest");
    expect(view.onSortChange).toHaveBeenCalledWith("highest");
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter by rating" }), "4");
    expect(view.onRatingFilterChange).toHaveBeenCalledWith(4);
  });

  it("votes a review helpful", async () => {
    const view = vm({ rows: [row({ voted: true, helpfulCount: 9 })] });
    const { user } = renderWithProviders(<ExperienceReviewsView {...view} />);
    const button = screen.getByRole("button", { name: "Helpful · 9" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.click(button);
    expect(view.onToggleHelpful).toHaveBeenCalledWith("ngozi");
  });

  it("shows more reviews, and no button when all are showing", async () => {
    const view = vm();
    const { user, rerender } = renderWithProviders(<ExperienceReviewsView {...view} />);
    await user.click(screen.getByRole("button", { name: "Show 3 more reviews" }));
    expect(view.onShowMore).toHaveBeenCalled();
    rerender(<ExperienceReviewsView {...vm({ showMoreLabel: null })} />);
    expect(screen.queryByRole("button", { name: /more review/ })).not.toBeInTheDocument();
  });

  it("says when nothing matches", () => {
    renderWithProviders(<ExperienceReviewsView {...vm({ rows: [], emptyMessage: 'No reviews mention "zebra".', summary: null })} />);
    expect(screen.getByText('No reviews mention "zebra".')).toBeInTheDocument();
    expect(screen.queryByText("What people say")).not.toBeInTheDocument();
  });
});
