import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeTasteQuizPopupView } from "./home-taste-quiz-popup-view";

describe("HomeTasteQuizPopupView", () => {
  it("offers the quiz, linking 'Take it' to it", () => {
    renderWithProviders(<HomeTasteQuizPopupView visible href="/onboarding" onDismiss={vi.fn()} />);

    expect(screen.getByText("This page can match your taste")).toBeInTheDocument();
    expect(screen.getByText(/seeing what everyone else sees/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Take it" })).toHaveAttribute("href", "/onboarding");
  });

  it("dismisses on 'Maybe later'", async () => {
    const onDismiss = vi.fn();
    const { user } = renderWithProviders(<HomeTasteQuizPopupView visible href="/onboarding" onDismiss={onDismiss} />);

    await user.click(screen.getByRole("button", { name: "Maybe later" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("renders nothing when not visible", () => {
    const { container } = renderWithProviders(<HomeTasteQuizPopupView visible={false} href="/onboarding" onDismiss={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
