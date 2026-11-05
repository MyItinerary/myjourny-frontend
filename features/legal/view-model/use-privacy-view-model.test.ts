import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePrivacyViewModel } from "./use-privacy-view-model";

describe("usePrivacyViewModel", () => {
  it("initializes with at-a-glance as default active section and Privacy Policy data", () => {
    const { result } = renderHook(() => usePrivacyViewModel());

    expect(result.current.activeSectionId).toBe("at-a-glance");
    expect(result.current.data.title).toBe("Privacy Policy");
  });

  it("changes activeSectionId and attempts to scroll to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-1";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => usePrivacyViewModel());

    act(() => {
      result.current.onSectionSelect("section-1");
    });

    expect(result.current.activeSectionId).toBe("section-1");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
