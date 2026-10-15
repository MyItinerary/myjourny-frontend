import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_HOME } from "../model/sample-home";
import { useHostHomeViewModel } from "./use-host-home-view-model";

const state = vi.hoisted(() => ({
  preview: null as string | null,
  firstName: "Tunde" as string | null,
}));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.preview ? `preview=${state.preview}` : "") }));
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
    expect(result.current.header.subtitle).toBe("You are approved. Nothing listed yet.");
    expect(result.current.header.actions).toEqual([
      { label: "Start a new listing", href: "/host/dashboard/listings/new", primary: true },
    ]);
    expect(result.current.examples.items).toHaveLength(3);
    expect(result.current.sellPoints).toHaveLength(3);
    expect(result.current.pitch.cta).toBe("Create your first experience");
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
      "/host/dashboard/profile",
      "/host/dashboard/help",
      "/host/dashboard/bookings",
    ]);
    expect(result.current.listingsHref).toBe("/host/dashboard/listings");
    expect(result.current.bookingsHref).toBe("/host/dashboard/bookings");
  });
});
