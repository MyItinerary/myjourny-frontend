import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ReviewsScoreView, ReviewsSummaryView } from "./reviews-score-view";

describe("ReviewsScoreView", () => {
  it("shows the average, the stars and each breakdown row", () => {
    renderWithProviders(
      <ReviewsScoreView
        rating="4.8"
        countLabel="124 reviews"
        breakdown={[
          { label: "Host", value: "4.9", width: "98%" },
          { label: "Value", value: "4.7", width: "94%" },
        ]}
      />,
    );
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "4.8 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByText("From 124 reviews")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("leaves the breakdown out when there is none", () => {
    renderWithProviders(<ReviewsScoreView rating="4.0" countLabel={null} breakdown={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("ReviewsSummaryView", () => {
  it("shows what people say", () => {
    renderWithProviders(<ReviewsSummaryView summary="Everyone loved it." />);
    expect(screen.getByText("What people say")).toBeInTheDocument();
    expect(screen.getByText("Everyone loved it.")).toBeInTheDocument();
  });
});
