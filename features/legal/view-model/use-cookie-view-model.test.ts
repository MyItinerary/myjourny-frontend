import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCookieViewModel } from "./use-cookie-view-model";

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

describe("useCookieViewModel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    toastSuccess.mockClear();
  });

  it("initializes with section-1 as default active section and Cookie Policy data", () => {
    const { result } = renderHook(() => useCookieViewModel());

    expect(result.current.activeSectionId).toBe("section-1");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Cookie Policy");
    expect(result.current.isPreferencesOpen).toBe(false);
    expect(result.current.preferences.strictlyNecessary).toBe(true);
    expect(result.current.preferences.preferences).toBe(true);
    expect(result.current.preferences.analytics).toBe(false);
  });

  it("changes activeSectionId and scrolls to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-2";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.onSectionSelect("section-2");
    });

    expect(result.current.activeSectionId).toBe("section-2");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });

  it("opens preferences and dispatches event on onManagePreferences", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.onManagePreferences();
    });

    expect(result.current.isPreferencesOpen).toBe(true);
    expect(dispatchSpy).toHaveBeenCalled();

    act(() => {
      result.current.closePreferences();
    });
    expect(result.current.isPreferencesOpen).toBe(false);
  });

  it("toggles preferences correctly", () => {
    const { result } = renderHook(() => useCookieViewModel());

    expect(result.current.preferences.analytics).toBe(false);

    act(() => {
      result.current.onTogglePreference("analytics");
    });
    expect(result.current.preferences.analytics).toBe(true);

    act(() => {
      result.current.onTogglePreference("analytics");
    });
    expect(result.current.preferences.analytics).toBe(false);
  });

  it("handles accept all, saves to storage, and notifies", () => {
    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.openPreferences();
      result.current.onAcceptAll();
    });

    expect(result.current.isPreferencesOpen).toBe(false);
    expect(result.current.preferences.analytics).toBe(true);
    expect(result.current.preferences.personalisation).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith("All cookies accepted");
  });

  it("handles reject non-essential, saves to storage, and notifies", () => {
    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.onRejectNonEssential();
    });

    expect(result.current.preferences.preferences).toBe(false);
    expect(result.current.preferences.analytics).toBe(false);
    expect(result.current.preferences.personalisation).toBe(false);
    expect(result.current.preferences.strictlyNecessary).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith("Non-essential cookies rejected");
  });

  it("handles save preferences and notifies", () => {
    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.openPreferences();
      result.current.onSavePreferences();
    });

    expect(result.current.isPreferencesOpen).toBe(false);
    expect(toastSuccess).toHaveBeenCalledWith("Cookie preferences saved");
  });
});
