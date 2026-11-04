import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSafetyViewModel } from "./use-safety-view-model";

describe("useSafetyViewModel", () => {
  it("initializes with section-1 as default active section and Safety Guide data", () => {
    const { result } = renderHook(() => useSafetyViewModel());

    expect(result.current.activeSectionId).toBe("section-1");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Safety Guide");
  });

  it("changes activeSectionId and scrolls to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-2";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useSafetyViewModel());

    act(() => {
      result.current.onSectionSelect("section-2");
    });

    expect(result.current.activeSectionId).toBe("section-2");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
