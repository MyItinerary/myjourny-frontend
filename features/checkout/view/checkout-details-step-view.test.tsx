import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";
import { CheckoutDetailsStepView } from "./checkout-details-step-view";

const details = (overrides: Partial<CheckoutViewModel["details"]> = {}): CheckoutViewModel["details"] => ({
  email: "juliet@example.com",
  phone: "",
  onPhoneChange: vi.fn(),
  note: "",
  onNoteChange: vi.fn(),
  canPay: false,
  pending: false,
  onConfirm: vi.fn(),
  ...overrides,
});

describe("CheckoutDetailsStepView", () => {
  it("shows the email and keeps pay disabled until the phone is valid", () => {
    renderWithProviders(<CheckoutDetailsStepView details={details()} />);

    expect(screen.getByRole("heading", { name: "Confirm your details and pay" })).toBeInTheDocument();
    expect(screen.getByText("juliet@example.com")).toBeInTheDocument();
    expect(screen.getByText("Payment secured by Paystack")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm and pay" })).toBeDisabled();
  });

  it("sends the phone and note up, and pays on submit", async () => {
    const props = details({ canPay: true, phone: "7016377711" });
    const { user } = renderWithProviders(<CheckoutDetailsStepView details={props} />);

    await user.type(screen.getByLabelText("Phone number"), "1");
    await user.type(screen.getByLabelText("Leave a note for the guide"), "Hi");
    expect(props.onPhoneChange).toHaveBeenCalled();
    expect(props.onNoteChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirm and pay" }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("shows progress while starting checkout", () => {
    renderWithProviders(<CheckoutDetailsStepView details={details({ pending: true })} />);
    expect(screen.getByRole("button", { name: "Starting checkout…" })).toBeInTheDocument();
  });
});
