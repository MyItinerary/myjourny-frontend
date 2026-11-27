import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostProfileViewModel } from "../view-model/use-host-profile-view-model";
import { PayoutsSection } from "./host-payouts-section-view";

const payouts = (over: Partial<NonNullable<HostProfileViewModel["payouts"]>> = {}): NonNullable<HostProfileViewModel["payouts"]> => ({
  account: null,
  accountLoading: false,
  accountError: null,
  banks: [{ name: "Example Bank", code: "000" }],
  banksLoading: false,
  banksError: null,
  bankCode: "000",
  accountNumber: "0123456789",
  resolvedName: null,
  confirmedName: false,
  formError: null,
  verifying: false,
  saving: false,
  startingStripe: false,
  history: [],
  historyLoading: false,
  historyError: null,
  onBankChange: vi.fn(),
  onAccountNumberChange: vi.fn(),
  onConfirmNameChange: vi.fn(),
  onRetryBanks: vi.fn(),
  onVerify: vi.fn(),
  onSave: vi.fn(),
  onStripeSetup: vi.fn(),
  onRefreshAccount: vi.fn(),
  ...over,
});

describe("PayoutsSection", () => {
  it("offers Paystack verification and Stripe onboarding", async () => {
    const props = payouts({ onVerify: vi.fn(), onStripeSetup: vi.fn() });
    const { user } = renderWithProviders(<PayoutsSection payouts={props} />);

    expect(screen.getByLabelText("Bank")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Example Bank" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Verify account" }));
    await user.click(screen.getByRole("button", { name: "Connect Stripe" }));
    expect(props.onVerify).toHaveBeenCalled();
    expect(props.onStripeSetup).toHaveBeenCalled();
  });

  it("requires confirming the resolved account name before saving", async () => {
    const props = payouts({ resolvedName: "Ada Okafor" });
    const { user } = renderWithProviders(<PayoutsSection payouts={props} />);
    const save = screen.getByRole("button", { name: "Save bank account" });

    expect(save).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: "I confirm this is the account I want payouts sent to." }));
    expect(props.onConfirmNameChange).toHaveBeenCalledWith(true);
  });

  it("lets the host retry when Paystack banks cannot be loaded", async () => {
    const props = payouts({ banksError: "Banks are temporarily unavailable" });
    const { user } = renderWithProviders(<PayoutsSection payouts={props} />);

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(props.onRetryBanks).toHaveBeenCalled();
  });

  it("shows payout history and an empty state", () => {
    const { rerender } = renderWithProviders(<PayoutsSection payouts={payouts()} />);
    expect(screen.getByText("No payouts have been recorded yet.")).toBeInTheDocument();

    rerender(<PayoutsSection payouts={payouts({ history: [{ id: "payout-1", date: "28 Nov 2026", experience: "Lagos art tour", currency: "NGN", amount: "₦3,000" }] })} />);
    expect(screen.getByText("Lagos art tour")).toBeInTheDocument();
    expect(screen.getByText("NGN")).toBeInTheDocument();
    expect(screen.getByText("₦3,000")).toBeInTheDocument();
  });
});
