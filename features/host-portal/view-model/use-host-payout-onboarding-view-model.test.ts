import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHostPayoutOnboardingViewModel } from "./use-host-payout-onboarding-view-model";

const query = vi.hoisted(() => ({
  data: { connected: true, provider: "stripe", onboarding_completed: false } as { connected: boolean; provider: string | null; onboarding_completed: boolean } | undefined,
  isPending: false,
  isError: false,
  error: null as unknown,
  refetch: vi.fn(),
}));
vi.mock("../model/payouts-data", () => ({ usePayoutAccount: () => ({ ...query }) }));

beforeEach(() => {
  query.data = { connected: true, provider: "stripe", onboarding_completed: false };
  query.isPending = false;
  query.isError = false;
  query.error = null;
  query.refetch.mockReset();
});

describe("useHostPayoutOnboardingViewModel", () => {
  it("shows a pending state while Stripe's webhook is still processing", () => {
    expect(renderHook(() => useHostPayoutOnboardingViewModel()).result.current).toMatchObject({
      status: "pending",
      message: expect.stringContaining("waiting for confirmation"),
    });
  });

  it("marks the account ready when onboarding is complete", () => {
    query.data = { connected: true, provider: "stripe", onboarding_completed: true };
    expect(renderHook(() => useHostPayoutOnboardingViewModel()).result.current).toMatchObject({
      status: "ready",
      message: expect.stringContaining("ready to receive payouts"),
    });
  });

  it("reports loading and API errors", () => {
    query.isPending = true;
    expect(renderHook(() => useHostPayoutOnboardingViewModel()).result.current.status).toBe("loading");

    query.isPending = false;
    query.isError = true;
    query.error = { response: { data: { detail: "Unavailable" } } };
    expect(renderHook(() => useHostPayoutOnboardingViewModel()).result.current).toMatchObject({ status: "error", error: "Unavailable" });
  });

  it("refreshes the account status on request", () => {
    const result = renderHook(() => useHostPayoutOnboardingViewModel());
    act(() => result.result.current.onRefresh());
    expect(query.refetch).toHaveBeenCalled();
  });
});
