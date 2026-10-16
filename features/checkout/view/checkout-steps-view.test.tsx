import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";
import { CheckoutStepsView } from "./checkout-steps-view";

const steps = (overrides: Partial<CheckoutViewModel["steps"]> = {}): CheckoutViewModel["steps"] => ({
  backHref: "/experiences/exp-1",
  account: null,
  onStartAuth: vi.fn(),
  canPay: false,
  paying: false,
  onConfirm: vi.fn(),
  ...overrides,
});

describe("CheckoutStepsView", () => {
  it("asks a guest to log in or sign up first, with nothing to pay yet", async () => {
    const props = steps();
    const { user } = renderWithProviders(<CheckoutStepsView steps={props} />);

    expect(screen.getByRole("heading", { name: "Confirm and pay" })).toBeInTheDocument();
    expect(screen.getByLabelText("Back to the experience")).toHaveAttribute("href", "/experiences/exp-1");
    expect(screen.getByRole("heading", { name: "1. Log in or sign up" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "2. Review and pay" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm and pay" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(props.onStartAuth).toHaveBeenCalled();
  });

  it("shows who is logged in and lets them confirm and pay", async () => {
    const props = steps({ account: "juliet@example.com", canPay: true });
    const { user } = renderWithProviders(<CheckoutStepsView steps={props} />);

    expect(screen.getByText("Logged in as juliet@example.com")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm and pay" }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("holds the button while the payment page is on its way", () => {
    renderWithProviders(<CheckoutStepsView steps={steps({ account: "juliet@example.com", paying: true })} />);
    expect(screen.getByRole("button", { name: "Starting payment…" })).toBeDisabled();
  });
});
