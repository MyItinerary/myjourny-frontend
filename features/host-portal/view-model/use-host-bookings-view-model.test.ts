import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHostBookingsViewModel } from "./use-host-bookings-view-model";

const nav = vi.hoisted(() => ({ preview: "full" as string | null }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.preview ? `preview=${nav.preview}` : ""),
}));
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

// Today is Saturday 19 September 2026.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 10, 0));
  nav.preview = "full";
  toast.info.mockReset();
});
afterEach(() => vi.useRealTimers());

const render = () => renderHook(() => useHostBookingsViewModel()).result;
const names = (result: { current: ReturnType<typeof useHostBookingsViewModel> }) => result.current.rows.map((r) => r.booking.name);

describe("the table", () => {
  it("lists every booking, requests first, with the page summary", () => {
    const result = render();

    expect(result.current.header).toMatchObject({ title: "Bookings", subtitle: "2 requests waiting on you" });
    expect(result.current.resultLine).toBe("All 6 bookings");
    expect(names(result)).toEqual(["Amaka Eze", "Chidi Okafor", "Ifeoma Adeyemi", "Yemi Balogun", "Segun Olaniyi", "Bisi Lawal"]);
    expect(result.current.rows[0].chip).toBe("In review");
    expect(result.current.rows[2].chip).toBe("Live");
    expect(result.current.scanHref).toBe("/host/dashboard/bookings/scan");
    expect(result.current.none).toBe(false);
  });

  it("is empty with no bookings", () => {
    nav.preview = null;
    const result = render();
    expect(result.current.header.subtitle).toBe("No bookings yet");
    expect(result.current.rows).toEqual([]);
    expect(result.current.none).toBe(true);
    expect(result.current.groups[1].options).toEqual([]);
  });
});

describe("search and filters", () => {
  it("searches by guest or reference", () => {
    const result = render();
    act(() => result.current.onQuery("mj-4488"));
    expect(names(result)).toEqual(["Yemi Balogun"]);
    expect(result.current.resultLine).toBe("1 booking");
    expect(result.current.hasFilters).toBe(true);
  });

  it("describes and applies each filter", () => {
    const result = render();
    const group = (key: string) => result.current.groups.find((g) => g.key === key)!;
    expect(result.current.groups.map((g) => [g.key, g.anyLabel])).toEqual([
      ["status", "Any status"],
      ["listing", "Any listing"],
      ["when", "All dates"],
    ]);
    expect(group("listing").options.map((o) => o.value)).toEqual(["Lagos Island Photowalk", "Freedom Park Portraits"]);

    act(() => result.current.onPick("status", "Upcoming"));
    expect(names(result)).toEqual(["Ifeoma Adeyemi", "Yemi Balogun"]);
    expect(group("status")).toMatchObject({ current: "Upcoming", active: true });

    act(() => result.current.onPick("listing", "Freedom Park Portraits"));
    expect(names(result)).toEqual(["Yemi Balogun"]);

    act(() => result.current.onPick("when", "Tomorrow"));
    expect(result.current.none).toBe(true);
    expect(group("when")).toMatchObject({ current: "Tomorrow", active: true });
  });

  it("clears everything, from either button", () => {
    const result = render();
    act(() => result.current.onPick("status", "Cancelled"));
    act(() => result.current.onQuery("x"));
    act(() => result.current.onClearFilters());
    expect(result.current.hasFilters).toBe(false);
    expect(result.current.rows).toHaveLength(6);

    act(() => result.current.onPick("when", "Today"));
    expect(result.current.none).toBe(true);
    act(() => result.current.onShowEverything());
    expect(result.current.rows).toHaveLength(6);
    expect(result.current.groups[2]).toMatchObject({ current: "Any", active: false });
  });
});

describe("a booking", () => {
  it("opens a request with its answer buttons, and closes", () => {
    const result = render();
    expect(result.current.detail).toBeNull();

    act(() => result.current.onOpen("b1"));

    expect(result.current.detail).toMatchObject({ acceptLabel: "Accept, 2 places", canCheckIn: false });
    expect(result.current.detail!.booking.deadline).toBe("You have 2 hours to answer this");

    act(() => result.current.onCloseDetail());
    expect(result.current.detail).toBeNull();
  });

  it("says place for a single guest, and lets an upcoming booking be scanned in", () => {
    const result = render();
    act(() => result.current.onOpen("b3"));
    expect(result.current.detail).toMatchObject({ canCheckIn: true, scanHref: "/host/dashboard/bookings/scan", chip: "Live" });

    act(() => result.current.onOpen("b5"));
    expect(result.current.detail).toMatchObject({ acceptLabel: "Accept, 1 place", canCheckIn: false, chip: "Rejected" });
  });

  it("says answering and reporting aren't connected yet", () => {
    const result = render();
    act(() => result.current.onAccept());
    act(() => result.current.onSayNo());
    act(() => result.current.onReportNoShow());
    expect(toast.info).toHaveBeenCalledTimes(3);
  });
});
