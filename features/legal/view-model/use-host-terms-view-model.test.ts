import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useHostTermsViewModel } from "./use-host-terms-view-model";

describe("useHostTermsViewModel", () => {
  it("initializes with short-version as default active section and Host Terms data", () => {
    const { result } = renderHook(() => useHostTermsViewModel());

    expect(result.current.activeSectionId).toBe("short-version");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Host Terms");
  });

  it("changes activeSectionId and attempts to scroll to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-1";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useHostTermsViewModel());

    act(() => {
      result.current.onSectionSelect("section-1");
    });

    expect(result.current.activeSectionId).toBe("section-1");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
