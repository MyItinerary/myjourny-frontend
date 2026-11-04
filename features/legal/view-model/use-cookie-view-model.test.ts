import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCookieViewModel } from "./use-cookie-view-model";

describe("useCookieViewModel", () => {
  it("initializes with section-1 as default active section and Cookie Policy data", () => {
    const { result } = renderHook(() => useCookieViewModel());

    expect(result.current.activeSectionId).toBe("section-1");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Cookie Policy");
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

  it("dispatches open-cookie-preferences event on onManagePreferences", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    const { result } = renderHook(() => useCookieViewModel());

    act(() => {
      result.current.onManagePreferences?.();
    });

    expect(dispatchSpy).toHaveBeenCalled();
  });
});
