import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { closeMobileSearch, openMobileSearch, useMobileSearchOpen } from "./mobile-search-store";

describe("mobile search store", () => {
  it("shares one open/closed state with every component that reads it", () => {
    const first = renderHook(() => useMobileSearchOpen());
    const second = renderHook(() => useMobileSearchOpen());
    expect(first.result.current).toBe(false);

    act(() => openMobileSearch());
    expect(first.result.current).toBe(true);
    expect(second.result.current).toBe(true);

    act(() => closeMobileSearch());
    expect(second.result.current).toBe(false);
  });
});
