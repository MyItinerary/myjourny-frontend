import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { readLastSearchArea, saveLastSearchArea, useLastSearchArea } from "./last-search-area";

describe("last searched area", () => {
  beforeEach(() => window.localStorage.clear());

  it("is null until an area is searched", () => {
    expect(readLastSearchArea()).toBeNull();
  });

  it("remembers the trimmed area and ignores blanks", () => {
    saveLastSearchArea("  Lekki ");
    expect(readLastSearchArea()).toBe("Lekki");
    saveLastSearchArea("   ");
    expect(readLastSearchArea()).toBe("Lekki");
  });

  it("updates anything showing it as soon as a new area is searched", () => {
    const { result } = renderHook(() => useLastSearchArea());
    expect(result.current).toBeNull();

    act(() => saveLastSearchArea("Ikoyi"));
    expect(result.current).toBe("Ikoyi");
  });
});
