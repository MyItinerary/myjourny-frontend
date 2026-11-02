import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setStoredPreview, usePreviewMode } from "./use-preview-mode";

const nav = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(nav.query) }));

beforeEach(() => {
  nav.query = "";
});
afterEach(() => window.localStorage.clear());

describe("usePreviewMode", () => {
  it("is off by default", () => {
    expect(renderHook(() => usePreviewMode()).result.current).toBeNull();
  });

  it("turns on with ?preview=full, and remembers it for pages without it", () => {
    nav.query = "preview=full";
    expect(renderHook(() => usePreviewMode()).result.current).toBe("full");
    expect(window.localStorage.getItem("myjourny:host-preview")).toBe("full");

    nav.query = "";
    expect(renderHook(() => usePreviewMode()).result.current).toBe("full");
  });

  it("follows the switch, both ways", () => {
    const { result } = renderHook(() => usePreviewMode());
    act(() => setStoredPreview("full"));
    expect(result.current).toBe("full");
    act(() => setStoredPreview(null));
    expect(result.current).toBeNull();
    expect(window.localStorage.getItem("myjourny:host-preview")).toBeNull();
  });

  it("ignores any other value", () => {
    nav.query = "preview=other";
    window.localStorage.setItem("myjourny:host-preview", "other");
    expect(renderHook(() => usePreviewMode()).result.current).toBeNull();
  });
});
