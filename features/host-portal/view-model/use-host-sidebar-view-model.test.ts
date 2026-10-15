import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HostSidebarData } from "../model/host-portal.types";
import { useHostSidebarViewModel } from "./use-host-sidebar-view-model";

const state = vi.hoisted(() => ({
  pathname: "/host/dashboard" as string | null,
  open: true,
  toggle: vi.fn(),
  data: null as unknown,
}));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("../model/rail-store", () => ({ useRailOpen: () => [state.open, state.toggle] }));
vi.mock("../model/host-sidebar-data", () => ({ useHostSidebarData: () => state.data }));

const data = (overrides: Partial<HostSidebarData["host"]> = {}, counts = { listings: 0, bookings: 0 }): HostSidebarData => ({
  counts,
  host: { name: "Tunde Bakare", photoUrl: null, verification: "verified", loading: false, ...overrides },
});

beforeEach(() => {
  state.pathname = "/host/dashboard";
  state.open = true;
  state.data = data();
});

describe("useHostSidebarViewModel", () => {
  it("lists the seven items and marks the current one", () => {
    state.pathname = "/host/dashboard/bookings";
    const { result } = renderHook(() => useHostSidebarViewModel());

    expect(result.current.items.map((i) => i.label)).toEqual([
      "Home", "Listings", "Calendar", "Bookings", "Earnings", "Profile", "Help",
    ]);
    expect(result.current.items.filter((i) => i.active).map((i) => i.key)).toEqual(["bookings"]);
  });

  it("keeps Listings active inside the builder", () => {
    state.pathname = "/host/dashboard/listings/new";
    const { result } = renderHook(() => useHostSidebarViewModel());
    expect(result.current.items.find((i) => i.active)?.key).toBe("listings");
  });

  it("puts counts on Listings and Bookings only, none for a new host", () => {
    state.data = data({}, { listings: 3, bookings: 120 });
    const { result } = renderHook(() => useHostSidebarViewModel());
    expect(Object.fromEntries(result.current.items.map((i) => [i.key, i.badge]))).toMatchObject({
      listings: "3",
      bookings: "99+",
      dashboard: null,
      earnings: null,
    });

    state.data = data();
    const fresh = renderHook(() => useHostSidebarViewModel());
    expect(fresh.result.current.items.every((i) => i.badge === null)).toBe(true);
  });

  it("passes the rail state and toggle through", () => {
    state.open = false;
    const { result } = renderHook(() => useHostSidebarViewModel());
    expect(result.current.open).toBe(false);
    result.current.onToggle();
    expect(state.toggle).toHaveBeenCalled();
  });

  it.each([
    ["verified", "Verified host", "green", false],
    ["business", "Registered business", "green", false],
    ["review", "Under review", "amber", true],
    ["info", "More info needed", "red", true],
  ] as const)("describes %s hosts", (verification, label, tone, dotOnAvatar) => {
    state.data = data({ verification });
    const { result } = renderHook(() => useHostSidebarViewModel());
    expect(result.current.host.status).toMatchObject({ label, tone, dotOnAvatar });
  });

  it("has no status until verification is known, and builds initials", () => {
    state.data = data({ verification: null, name: "tunde bakare okafor" });
    const { result } = renderHook(() => useHostSidebarViewModel());
    expect(result.current.host.status).toBeNull();
    expect(result.current.host.initials).toBe("TB");

    state.data = data({ name: "   " });
    expect(renderHook(() => useHostSidebarViewModel()).result.current.host.initials).toBe("H");
  });
});
