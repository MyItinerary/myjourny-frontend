import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { TasteQuizCtaView } from "./taste-quiz-cta-view";

describe("TasteQuizCtaView", () => {
  it("shows the pitch and links 'Take it' to the quiz", () => {
    renderWithProviders(<TasteQuizCtaView visible href="/onboarding" />);

    expect(screen.getByText(/seeing what everyone else sees/i)).toBeInTheDocument();
    expect(screen.getByText("Take it").closest("a")).toHaveAttribute("href", "/onboarding");
  });

  it("renders nothing when not visible", () => {
    const { container } = renderWithProviders(<TasteQuizCtaView visible={false} href="/onboarding" />);
    expect(container).toBeEmptyDOMElement();
  });
});
