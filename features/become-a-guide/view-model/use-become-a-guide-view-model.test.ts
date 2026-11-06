import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useBecomeAGuideViewModel } from "./use-become-a-guide-view-model";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useBecomeAGuideViewModel", () => {
  it("initializes with default photographer preset and matching earnings", () => {
    const { result } = renderHook(() => useBecomeAGuideViewModel());

    expect(result.current.selectedProfessionId).toBe("photographer");
    expect(result.current.pricePerPerson).toBe(10000);
    expect(result.current.groupSize).toBe(8);
    expect(result.current.sessionsPerMonth).toBe(4);
    expect(result.current.earnings.revenuePerSession).toBe(80000);
    expect(result.current.earnings.payoutPerSession).toBe(68000);
    expect(result.current.earnings.monthlyEarnings).toBe(272000);
  });

  it("updates inputs when profession is changed", () => {
    const { result } = renderHook(() => useBecomeAGuideViewModel());

    act(() => {
      result.current.onSelectProfession("boat-operator");
    });

    expect(result.current.selectedProfessionId).toBe("boat-operator");
    expect(result.current.pricePerPerson).toBe(25000);
    expect(result.current.groupSize).toBe(8);
    expect(result.current.sessionsPerMonth).toBe(4);
    expect(result.current.earnings.revenuePerSession).toBe(200000);
  });

  it("updates earnings when sliders change", () => {
    const { result } = renderHook(() => useBecomeAGuideViewModel());

    act(() => {
      result.current.onPriceChange(15000);
      result.current.onGroupSizeChange(10);
      result.current.onSessionsChange(2);
    });

    expect(result.current.earnings.revenuePerSession).toBe(150000);
    expect(result.current.earnings.payoutPerSession).toBe(127500);
    expect(result.current.earnings.monthlyEarnings).toBe(255000);
  });

  it("navigates on start application", () => {
    const { result } = renderHook(() => useBecomeAGuideViewModel());

    act(() => {
      result.current.onStartApplication();
    });

    expect(mockPush).toHaveBeenCalledWith("/host/dashboard/listings/new");
  });
});
