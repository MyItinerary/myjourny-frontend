import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";
import { CheckoutEmailStepView } from "./checkout-email-step-view";

vi.mock("@/components/onboarding/google-auth-button", () => ({
  GoogleAuthButton: () => <button type="button">Continue with Google</button>,
}));

const email = (overrides: Partial<CheckoutViewModel["email"]> = {}): CheckoutViewModel["email"] => ({
  value: "",
  onChange: vi.fn(),
  canContinue: false,
  pending: false,
  onContinue: vi.fn(),
  onGoogleCredential: vi.fn(),
  googleLoading: false,
  ...overrides,
});

describe("CheckoutEmailStepView", () => {
  it("asks where to send the booking and holds the spot", () => {
    renderWithProviders(<CheckoutEmailStepView email={email()} />);

    expect(screen.getByRole("heading", { name: "Where should we send your booking details?" })).toBeInTheDocument();
    expect(screen.getByText("We’ll hold your spot for 5 minutes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("passes the typed email up and continues on submit", async () => {
    const props = email({ canContinue: true, value: "juliet@example.com" });
    const { user } = renderWithProviders(<CheckoutEmailStepView email={props} />);

    await user.type(screen.getByLabelText("Email address"), "x");
    expect(props.onChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(props.onContinue).toHaveBeenCalled();
  });

  it("shows progress while continuing", () => {
    renderWithProviders(<CheckoutEmailStepView email={email({ pending: true })} />);
    expect(screen.getByRole("button", { name: "Continuing…" })).toBeInTheDocument();
  });
});
