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

  it("renders nothing when not visible", () => {
    const { container } = renderWithProviders(<TasteQuizSectionView visible={false} href="/onboarding" />);
    expect(container).toBeEmptyDOMElement();
  });
});
