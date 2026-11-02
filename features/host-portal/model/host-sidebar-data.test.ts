import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHostSidebarData } from "./host-sidebar-data";

const session = vi.hoisted(() => ({
  value: { user: null as { fullName: string | null; email: string | null; avatarUrl: string | null } | null, hydrated: true },
}));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => session.value }));

beforeEach(() => {
  session.value = { user: null, hydrated: true };
});

describe("useHostSidebarData", () => {
  it("uses the signed-in host's name and photo, with no counts or status yet", () => {
    session.value = { user: { fullName: " Tunde Bakare ", email: "t@example.com", avatarUrl: "/t.jpg" }, hydrated: true };
    const { host, counts } = renderHook(() => useHostSidebarData()).result.current;

    expect(host).toEqual({ name: "Tunde Bakare", photoUrl: "/t.jpg", verification: null, loading: false });
    expect(counts).toEqual({ listings: 0, bookings: 0 });
  });

  it("falls back to the email, then a generic name", () => {
    session.value = { user: { fullName: null, email: "t@example.com", avatarUrl: null }, hydrated: true };
    expect(renderHook(() => useHostSidebarData()).result.current.host.name).toBe("t@example.com");

    session.value = { user: null, hydrated: true };
    expect(renderHook(() => useHostSidebarData()).result.current.host.name).toBe("Your account");
  });

  it("is loading until the session has been read", () => {
    session.value = { user: null, hydrated: false };
    expect(renderHook(() => useHostSidebarData()).result.current.host.loading).toBe(true);
  });
});
