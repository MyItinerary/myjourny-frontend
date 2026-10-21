import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceReviewsViewModel } from "../view-model/use-experience-reviews-view-model";
import { ExperienceReviewsView } from "./experience-reviews-view";

function vm(overrides: Partial<ExperienceReviewsViewModel> = {}): ExperienceReviewsViewModel {
  return {
    rating: "4.5",
    countLabel: "2 reviews",
    reviews: [
      { id: "a", author: "Ireti G.", avatarUrl: null, initial: "I", rating: 5, comment: "Loved it", date: "12 Oct 2026" },
      { id: "b", author: "Tunde", avatarUrl: null, initial: "T", rating: 4, comment: null, date: "10 Oct 2026" },
    ],
    hasMore: false,
    loadingMore: false,
    onShowMore: vi.fn(),
    ...overrides,
  };
}

describe("ExperienceReviewsView", () => {
  it("shows the average, the count and each review", () => {
    renderWithProviders(<ExperienceReviewsView {...vm()} />);
    expect(screen.getByRole("heading", { name: /^4\.5/ })).toHaveTextContent("4.5 · 2 reviews");
    expect(screen.getByText("Ireti G.")).toBeInTheDocument();
    expect(screen.getByText("Loved it")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument();
  });

  it("says when there are no reviews yet", () => {
    renderWithProviders(<ExperienceReviewsView {...vm({ rating: null, countLabel: null, reviews: [] })} />);
    expect(screen.getByRole("heading", { name: "No reviews yet" })).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("loads more reviews on request", async () => {
    const onShowMore = vi.fn();
    renderWithProviders(<ExperienceReviewsView {...vm({ hasMore: true, onShowMore })} />);
    await userEvent.click(screen.getByRole("button", { name: "Show more reviews" }));
    expect(onShowMore).toHaveBeenCalled();
  });
});
