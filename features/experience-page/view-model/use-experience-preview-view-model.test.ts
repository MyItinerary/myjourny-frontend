import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { previewTokenFor } from "@/lib/experience-preview";

import { useExperiencePreviewViewModel } from "./use-experience-preview-view-model";

const pageOptions = vi.fn();
vi.mock("./use-experience-page-view-model", () => ({
  useExperiencePageViewModel: (id: string, options: unknown) => {
    // The token has to be in place by the time the page's queries run.
    pageOptions(id, options, previewTokenFor(`/experiences/${id}`));
    return { marker: "page" };
  },
}));

afterEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("useExperiencePreviewViewModel", () => {
  it("sends the link's token with the page's first requests and tidies the address bar", () => {
    window.history.replaceState(null, "", "/experiences/exp-1/preview#t=tok");

    const { result, unmount } = renderHook(() => useExperiencePreviewViewModel("exp-1"));

    expect(result.current).toEqual({ marker: "page" });
    expect(pageOptions).toHaveBeenCalledWith("exp-1", { preview: true }, "tok");
    expect(window.location.hash).toBe("");

    unmount();
    expect(previewTokenFor("/experiences/exp-1")).toBeNull();
  });

  it("still opens the page without a token, so it can say the link has expired", () => {
    pageOptions.mockClear();
    renderHook(() => useExperiencePreviewViewModel("exp-2"));
    expect(pageOptions).toHaveBeenCalledWith("exp-2", { preview: true }, null);
  });
});
