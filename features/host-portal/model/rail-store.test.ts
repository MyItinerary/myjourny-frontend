import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useRailOpen } from "./rail-store";

afterEach(() => window.localStorage.clear());

describe("useRailOpen", () => {
  it("starts open", () => {
    expect(renderHook(() => useRailOpen()).result.current[0]).toBe(true);
  });

  it("toggles and remembers the choice", () => {
    const first = renderHook(() => useRailOpen());
    act(() => first.result.current[1]());
    expect(first.result.current[0]).toBe(false);
    expect(window.localStorage.getItem("myjourny:host-rail-open")).toBe("closed");

    // A later visit finds the rail as it was left.
    expect(renderHook(() => useRailOpen()).result.current[0]).toBe(false);

    act(() => first.result.current[1]());
    expect(first.result.current[0]).toBe(true);
  });
});
