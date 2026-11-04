import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCancellationViewModel } from "./use-cancellation-view-model";

describe("useCancellationViewModel", () => {
  it("initializes with short-version as default active section and cancellation title", () => {
    const { result } = renderHook(() => useCancellationViewModel());

    expect(result.current.activeSectionId).toBe("short-version");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Cancellation and Refund Policy");
  });

  it("changes activeSectionId and attempts to scroll to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-1";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useCancellationViewModel());

    act(() => {
      result.current.onSectionSelect("section-1");
    });

    expect(result.current.activeSectionId).toBe("section-1");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
