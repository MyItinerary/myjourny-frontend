import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostPayoutOnboardingViewModel } from "../view-model/use-host-payout-onboarding-view-model";
import { HostPayoutOnboardingView } from "./host-payout-onboarding-view";

const vm = (over: Partial<HostPayoutOnboardingViewModel> = {}): HostPayoutOnboardingViewModel => ({
  status: "pending",
  message: "Stripe has received your details. We are waiting for confirmation and will check again automatically.",
  error: null,
  onRefresh: vi.fn(),
  ...over,
});

describe("HostPayoutOnboardingView", () => {
  it("shows the pending state and lets the host check again", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostPayoutOnboardingView vm={props} />);

    expect(screen.getByText("Stripe setup is being confirmed")).toBeInTheDocument();
    expect(screen.getByText(props.message)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check status now" }));
    expect(props.onRefresh).toHaveBeenCalled();
  });

  it("shows ready, loading and error feedback", () => {
    const { rerender } = renderWithProviders(<HostPayoutOnboardingView vm={vm({ status: "ready", message: "Stripe is ready." })} />);
    expect(screen.getByText("Stripe payouts are ready")).toBeInTheDocument();

    rerender(<HostPayoutOnboardingView vm={vm({ status: "loading" })} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading your payout status");

    rerender(<HostPayoutOnboardingView vm={vm({ status: "error", error: "Unavailable" })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Unavailable");
    expect(screen.getByRole("link", { name: "Return to payout settings" })).toHaveAttribute("href", "/host/dashboard/profile?pane=payouts");
  });
});
