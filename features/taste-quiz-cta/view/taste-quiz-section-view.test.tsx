import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { TasteQuizSectionView } from "./taste-quiz-section-view";

describe("TasteQuizSectionView", () => {
  it("shows the pitch and links 'Take it' to the quiz", () => {
    renderWithProviders(<TasteQuizSectionView visible href="/onboarding" />);

    expect(screen.getByText(/seeing what everyone else sees/i)).toBeInTheDocument();
    expect(screen.getByText("Take it").closest("a")).toHaveAttribute("href", "/onboarding");
  });

  it("swaps in custom copy for the drifted variant", () => {
    renderWithProviders(
      <TasteQuizSectionView visible href="/onboarding/get-to-know-you" title="Your taste has drifted." body="Three booked." ctaLabel="Update my taste" />,
    );

    expect(screen.getByText("Your taste has drifted.")).toBeInTheDocument();
    expect(screen.getByText("Three booked.")).toBeInTheDocument();
    expect(screen.getByText("Update my taste").closest("a")).toHaveAttribute("href", "/onboarding/get-to-know-you");
  });

  it("renders nothing when not visible", () => {
    const { container } = renderWithProviders(<TasteQuizSectionView visible={false} href="/onboarding" />);
    expect(container).toBeEmptyDOMElement();
  });
});
