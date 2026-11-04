import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTermsViewModel } from "./use-terms-view-model";

describe("useTermsViewModel", () => {
  it("initializes with short-version as default active section", () => {
    const { result } = renderHook(() => useTermsViewModel());

    expect(result.current.activeSectionId).toBe("short-version");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Terms of Use");
  });

  it("changes activeSectionId and attempts to scroll to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-2";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useTermsViewModel());

    act(() => {
      result.current.onSectionSelect("section-2");
    });

    expect(result.current.activeSectionId).toBe("section-2");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
