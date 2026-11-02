import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useEventCategoryViewModel } from "./use-event-category-view-model";

describe("useEventCategoryViewModel", () => {
  it("names the category from its slug", () => {
    const { result } = renderHook(() => useEventCategoryViewModel("talks-conferences"));
    expect(result.current.label).toBe("Talks Conferences");
  });

  it("reads an encoded slug", () => {
    const { result } = renderHook(() => useEventCategoryViewModel("arts%20culture"));
    expect(result.current.label).toBe("Arts Culture");
  });
});
