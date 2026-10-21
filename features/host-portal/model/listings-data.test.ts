import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostListings } from "./listings-data";

afterEach(() => vi.unstubAllEnvs());

describe("useHostListings", () => {
  it("has no listings until itin has a host API", () => {
    expect(renderHook(() => useHostListings(null)).result.current).toEqual([]);
  });

  it("shows the eight sample listings for ?preview=full", () => {
    expect(renderHook(() => useHostListings("full")).result.current).toHaveLength(8);
  });

  it("ignores the preview in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(renderHook(() => useHostListings("full")).result.current).toEqual([]);
  });
});
