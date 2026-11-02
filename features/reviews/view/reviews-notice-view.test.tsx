import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import {
  EarlyReviewsNotice,
  NewListingNotice,
  NoResultsNotice,
  ReviewsErrorNotice,
  ReviewsSkeleton,
} from "./reviews-notice-view";

describe("review notices", () => {
  it("explains early reviews and new listings", () => {
    renderWithProviders(
      <>
        <EarlyReviewsNotice />
        <NewListingNotice />
      </>,
    );
    expect(screen.getByText("Early reviews")).toBeInTheDocument();
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("retries after an error", async () => {
    const onRetry = vi.fn();
    renderWithProviders(<ReviewsErrorNotice onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("clears when nothing matches", async () => {
    const onClear = vi.fn();
    renderWithProviders(<NoResultsNotice onClear={onClear} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear search and filters" }));
    expect(onClear).toHaveBeenCalled();
  });

  it("marks the skeleton as busy", () => {
    renderWithProviders(<ReviewsSkeleton />);
    expect(screen.getByLabelText("Loading reviews")).toHaveAttribute("aria-busy", "true");
  });
});
