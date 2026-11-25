import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useMobileTabBarViewModel } from "./use-mobile-tab-bar-view-model";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

afterEach(() => {
  nav.pathname = "/";
  vi.unstubAllEnvs();
});

describe("useMobileTabBarViewModel", () => {
  it("shows Home, Experiences, Events and My wishlists on the home page, with the desktop pictures", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());

    expect(result.current.visible).toBe(true);
    expect(result.current.hidden).toBe(false);
    expect(result.current.tabs.map((t) => [t.label, t.href, t.icon, t.active])).toEqual([
      ["Home", "/", "/icons/nav/home.png", true],
      ["Experiences", "/experiences", "/icons/nav/experiences.png", false],
      ["Events", "/events", "/icons/nav/events.png", false],
      ["My wishlists", "/wishlists", "/icons/nav/wishlist.png", false],
    ]);
  });

  it("leaves Events out while events are off", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());

    expect(result.current.tabs.map((t) => t.id)).toEqual(["home", "experiences", "wishlists"]);
  });

  it("stays on every page its tabs open, marking the one you're on", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    for (const path of ["/", "/experiences", "/events", "/wishlists"]) {
      nav.pathname = path;
      const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());
      expect(result.current.visible).toBe(true);
      expect(result.current.tabs.filter((t) => t.active).map((t) => t.href)).toEqual([path]);
    }
  });

  it("isn't on deeper pages, or on Events while events are off", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    for (const path of ["/search", "/experiences/exp-1", "/wishlists/abc", "/cities/lagos", "/events"]) {
      nav.pathname = path;
      const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());
      expect(result.current.visible).toBe(false);
    }
  });
});
