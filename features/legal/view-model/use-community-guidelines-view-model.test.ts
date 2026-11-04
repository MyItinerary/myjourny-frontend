import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommunityGuidelinesViewModel } from "./use-community-guidelines-view-model";

describe("useCommunityGuidelinesViewModel", () => {
  it("initializes with short-version as default active section and Community Guidelines data", () => {
    const { result } = renderHook(() => useCommunityGuidelinesViewModel());

    expect(result.current.activeSectionId).toBe("short-version");
    expect(result.current.backHref).toBe("/legal");
    expect(result.current.backLabel).toBe("All legal documents");
    expect(result.current.data.title).toBe("Community Guidelines and Reviews Policy");
  });

  it("changes activeSectionId and scrolls to element onSectionSelect", () => {
    const scrollIntoViewMock = vi.fn();
    const mockElement = document.createElement("div");
    mockElement.id = "section-a2";
    mockElement.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useCommunityGuidelinesViewModel());

    act(() => {
      result.current.onSectionSelect("section-a2");
    });

    expect(result.current.activeSectionId).toBe("section-a2");
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(mockElement);
  });
});
