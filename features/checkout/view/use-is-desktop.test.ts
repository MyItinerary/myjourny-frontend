import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsDesktop } from "./use-is-desktop";

afterEach(() => vi.unstubAllGlobals());

function viewport(matches: boolean) {
  const add = vi.fn();
  const remove = vi.fn();
  vi.stubGlobal("matchMedia", (query: string) => ({ matches, media: query, addEventListener: add, removeEventListener: remove }));
  return { add, remove };
}

describe("useIsDesktop", () => {
  it("is true on a wide screen and false on a phone", () => {
    viewport(true);
    expect(renderHook(() => useIsDesktop()).result.current).toBe(true);
    viewport(false);
    expect(renderHook(() => useIsDesktop()).result.current).toBe(false);
  });

  it("follows the viewport and stops listening when unmounted", () => {
    const { add, remove } = viewport(true);
    const { unmount } = renderHook(() => useIsDesktop());
    expect(add).toHaveBeenCalledWith("change", expect.any(Function));
    unmount();
    expect(remove).toHaveBeenCalledWith("change", add.mock.calls[0][1]);
  });

  it("assumes a wide screen where the browser can't say", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(renderHook(() => useIsDesktop()).result.current).toBe(true);
  });
});
