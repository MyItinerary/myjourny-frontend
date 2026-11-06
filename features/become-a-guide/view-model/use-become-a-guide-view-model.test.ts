import { act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";
import { useBecomeAGuideViewModel } from "./use-become-a-guide-view-model";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useBecomeAGuideViewModel", () => {
  beforeEach(() => {
    server.use(
      http.get(apiUrl("/experiences/filter"), () => {
        return HttpResponse.json({ items: [] });
      })
    );
  });
  it("initializes with default photographer preset and matching earnings", () => {
    const { result } = renderHookWithProviders(() => useBecomeAGuideViewModel());

    expect(result.current.selectedProfessionId).toBe("photographer");
    expect(result.current.pricePerPerson).toBe(10000);
    expect(result.current.groupSize).toBe(8);
    expect(result.current.sessionsPerMonth).toBe(4);
    expect(result.current.earnings.revenuePerSession).toBe(80000);
    expect(result.current.earnings.payoutPerSession).toBe(68000);
    expect(result.current.earnings.monthlyEarnings).toBe(272000);
    expect(result.current.steps).toHaveLength(3);
    expect(result.current.sampleExperiences).toHaveLength(8);
    expect(result.current.faqItems).toHaveLength(9);
    expect(result.current.openFaqId).toBe("cost-to-list");
  });

  it("toggles faq items correctly", () => {
    const { result } = renderHookWithProviders(() => useBecomeAGuideViewModel());

    act(() => {
      result.current.onToggleFaq("commission");
    });
    expect(result.current.openFaqId).toBe("commission");

    act(() => {
      result.current.onToggleFaq("commission");
    });
    expect(result.current.openFaqId).toBeNull();
  });

  it("updates inputs when profession is changed", () => {
    const { result } = renderHookWithProviders(() => useBecomeAGuideViewModel());

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
    const { result } = renderHookWithProviders(() => useBecomeAGuideViewModel());

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
    const { result } = renderHookWithProviders(() => useBecomeAGuideViewModel());

    act(() => {
      result.current.onStartApplication();
    });

    expect(mockPush).toHaveBeenCalledWith("/become-a-guide/apply");
  });
});
