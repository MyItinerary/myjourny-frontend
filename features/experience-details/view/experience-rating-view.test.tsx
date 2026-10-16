import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceRatingView } from "./experience-rating-view";

describe("ExperienceRatingView", () => {
  it("shows the real rating and no made-up review count", () => {
    renderWithProviders(<ExperienceRatingView rating="4.8" />);
    expect(screen.getByRole("heading", { name: "4.8" })).toBeInTheDocument();
    expect(screen.queryByText(/reviews$/)).not.toBeInTheDocument();
  });

  it("says when there are no reviews yet", () => {
    renderWithProviders(<ExperienceRatingView rating={null} />);
    expect(screen.getByRole("heading", { name: "No reviews yet" })).toBeInTheDocument();
  });
});
