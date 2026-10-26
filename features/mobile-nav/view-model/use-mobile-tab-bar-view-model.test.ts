import { act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { closeMobileSearch } from "./mobile-search-store";
import { tabBarVisible, useMobileTabBarViewModel } from "./use-mobile-tab-bar-view-model";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));
const session = vi.hoisted(() => ({ user: null as null | { email: string } }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: session.user }) }));

afterEach(() => {
  nav.pathname = "/";
  session.user = null;
  act(() => closeMobileSearch());
});

describe("useMobileTabBarViewModel", () => {
  it("sends a signed-in traveller to their wishlists, trips and profile", () => {
    session.user = { email: "ada@example.com" };
    nav.pathname = "/wishlists/abc";
    const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());

    expect(result.current.tabs.map((t) => [t.label, t.href, t.active])).toEqual([
      ["Home", "/", false],
      ["Search", null, false],
      ["Wishlists", "/wishlists", true],
      ["Trips", "/my-experiences", false],
      ["Profile", "/profile", false],
    ]);
  });

  it("sends a guest to log in for the account tabs", () => {
    const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());

    expect(result.current.tabs.find((t) => t.id === "home")?.active).toBe(true);
    expect(result.current.tabs.filter((t) => t.href === "/login").map((t) => t.label)).toEqual([
      "Wishlists",
      "Trips",
      "Log in",
    ]);
  });

  it("opens and closes the one search sheet, marking Search as the active tab", () => {
    const { result } = renderHookWithProviders(() => useMobileTabBarViewModel());

    act(() => result.current.onOpenSearch());
    expect(result.current.searchOpen).toBe(true);
    expect(result.current.tabs.filter((t) => t.active).map((t) => t.id)).toEqual(["search"]);

    act(() => result.current.onCloseSearch());
    expect(result.current.searchOpen).toBe(false);
  });
});

describe("tabBarVisible", () => {
  it("shows on browsing and account pages", () => {
    for (const path of ["/", "/search", "/categories/street-life", "/cities/lagos", "/wishlists", "/my-experiences", "/profile"]) {
      expect(tabBarVisible(path)).toBe(true);
    }
  });

  it("stays out of pages with their own bottom bar or flow", () => {
    for (const path of ["/experiences/abc", "/checkout", "/bookings/b-1", "/login", "/onboarding/interests", "/host/dashboard"]) {
      expect(tabBarVisible(path)).toBe(false);
    }
  });
});
