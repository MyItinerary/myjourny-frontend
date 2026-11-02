import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHostPreviewSwitchViewModel } from "./use-host-preview-switch-view-model";

const nav = vi.hoisted(() => ({ query: "", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  usePathname: () => "/host/dashboard/profile",
  useSearchParams: () => new URLSearchParams(nav.query),
}));

beforeEach(() => {
  nav.query = "";
  nav.replace.mockReset();
});
afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllEnvs();
});

describe("useHostPreviewSwitchViewModel", () => {
  it("starts on empty, and shows while developing", () => {
    const { current } = renderHook(() => useHostPreviewSwitchViewModel()).result;
    expect(current).toMatchObject({ visible: true, mode: "empty" });
  });

  it("hides in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(renderHook(() => useHostPreviewSwitchViewModel()).result.current.visible).toBe(false);
  });

  it("switches to the filled view and back, remembering it", () => {
    const { result } = renderHook(() => useHostPreviewSwitchViewModel());

    act(() => result.current.onChange("full"));
    expect(result.current.mode).toBe("full");
    expect(window.localStorage.getItem("myjourny:host-preview")).toBe("full");

    act(() => result.current.onChange("empty"));
    expect(result.current.mode).toBe("empty");
    expect(window.localStorage.getItem("myjourny:host-preview")).toBeNull();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("takes ?preview out of the address so it stops deciding, keeping the other parts", () => {
    nav.query = "preview=full&pane=payouts";
    const { result } = renderHook(() => useHostPreviewSwitchViewModel());

    act(() => result.current.onChange("empty"));
    expect(nav.replace).toHaveBeenCalledWith("/host/dashboard/profile?pane=payouts");

    nav.query = "preview=full";
    const only = renderHook(() => useHostPreviewSwitchViewModel());
    act(() => only.result.current.onChange("empty"));
    expect(nav.replace).toHaveBeenLastCalledWith("/host/dashboard/profile");
  });
});
