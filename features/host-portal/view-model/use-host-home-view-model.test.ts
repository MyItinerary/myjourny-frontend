import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_HOME } from "../model/sample-home";
import { useHostHomeViewModel } from "./use-host-home-view-model";

const state = vi.hoisted(() => ({
  preview: null as string | null,
  firstName: "Tunde" as string | null,
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.preview ? `preview=${state.preview}` : "") }));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: { fullName: "Tunde Bakare", email: "tunde@example.com" } }) }));
vi.mock("../model/home-data", () => ({
  useHostHome: (preview: string | null) => ({
    state: preview === "full" ? { kind: "full", data: SAMPLE_HOME } : { kind: "empty" },
    firstName: state.firstName,
  }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 14, 10));
  state.preview = null;
  state.firstName = "Tunde";
});
afterEach(() => vi.useRealTimers());

describe("useHostHomeViewModel", () => {
  it("greets the host by name for the time of day", () => {
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.header.title).toBe("Good afternoon, Tunde");
  });

  it("greets without a name when there isn't one", () => {
    state.firstName = null;
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.header.title).toBe("Good afternoon");
  });

  it("has the new-host Home and its subtitle when nothing is listed", () => {
    const { result } = renderHook(() => useHostHomeViewModel());

    expect(result.current.kind).toBe("empty");
    expect(result.current.header.subtitle).toBe("Nothing listed yet.");
    expect(result.current.sellPoints).toHaveLength(3);
    expect(result.current.pitch.cta).toBe("Create your first experience");
  });

  it("gives a new host no button in the header, only the card", () => {
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.header.actions).toEqual([]);
  });

  it("keeps Start a new experience in the header once the host has experiences", () => {
    state.preview = "full";
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.header.actions).toEqual([
      { label: "Start a new experience", href: "/host/dashboard/listings/new", primary: true },
    ]);
  });

  it("nudges a new host to get verified, each step opening its part of the profile", () => {
    const { result } = renderHook(() => useHostHomeViewModel());

    expect(result.current.setup).toMatchObject({ heading: "Finish setting up", count: "0 of 3 done", percent: 6 });
    expect(result.current.setup!.note).toMatch(/review every host before their experiences go live/);
    expect(result.current.setup!.tasks.map((t) => [t.title, t.href])).toEqual([
      ["Confirm who you are", "/host/dashboard/profile?pane=verify"],
      ["Write your public profile", "/host/dashboard/profile?pane=public"],
      ["Add the account we pay into", "/host/dashboard/profile?pane=payouts"],
    ]);
  });

  it("leaves the setup card out for a host with nothing left to set up", () => {
    state.preview = "full";
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.setup).toBeNull();
  });

  it("links each template into the builder", () => {
    const { result } = renderHook(() => useHostHomeViewModel());

    expect(result.current.templates.heading).toBe("Templates you can start from");
    expect(result.current.templates.items.map((t) => t.href)).toEqual([
      "/host/dashboard/listings/new?template=portrait-walk",
      "/host/dashboard/listings/new?template=market-to-plate",
      "/host/dashboard/listings/new?template=boat-morning",
    ]);
  });

  it("has the populated Home, counting what needs the host", () => {
    state.preview = "full";
    const { result } = renderHook(() => useHostHomeViewModel());

    expect(result.current.kind).toBe("full");
    expect(result.current.header.subtitle).toBe("Saturday 19 September · three things need you today");
  });

  it("links the quick actions into the portal", () => {
    const { result } = renderHook(() => useHostHomeViewModel());
    expect(result.current.quick.map((q) => q.href)).toEqual([
      "/host/dashboard/listings/new",
      "/host/dashboard/profile?pane=payouts",
      "/host/dashboard/help?guide=1",
      "/host/dashboard/bookings",
    ]);
    expect(result.current.listingsHref).toBe("/host/dashboard/listings");
    expect(result.current.bookingsHref).toBe("/host/dashboard/bookings");
  });
});
