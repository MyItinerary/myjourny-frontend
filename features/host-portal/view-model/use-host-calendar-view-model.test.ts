import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useHostCalendarViewModel } from "./use-host-calendar-view-model";

const nav = vi.hoisted(() => ({ preview: "full" as string | null }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(nav.preview ? `preview=${nav.preview}` : ""),
}));
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

// Today is Saturday 19 September 2026, so the sample dates are 20, 21, 26 and 27,
// and 30 September and 1 October are blocked.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 19, 10, 0));
  nav.preview = "full";
  toast.info.mockReset();
});
afterEach(() => vi.useRealTimers());

const render = () => renderHook(() => useHostCalendarViewModel()).result;
const cell = (result: ReturnType<typeof render>, date: string) => result.current.cells.find((c) => c.date === date)!;

describe("the month", () => {
  it("shows September 2026, Monday first, with today marked and earlier dates past", () => {
    const result = render();

    expect(result.current.ready).toBe(true);
    expect(result.current.title).toBe("September 2026");
    expect(result.current.weekdays[0]).toBe("Mon");
    expect(result.current.cells).toHaveLength(35);
    expect(cell(result, "2026-09-19")).toMatchObject({ today: true, past: false });
    expect(cell(result, "2026-09-18")).toMatchObject({ today: false, past: true });
  });

  it("puts the sample dates on it, sold out in blue and booked in red", () => {
    const result = render();

    expect(cell(result, "2026-09-20")).toMatchObject({ tone: "booked" });
    expect(cell(result, "2026-09-20").events[0].title).toBe("Photowalk 16:00");
    expect(cell(result, "2026-09-21").tone).toBe("sold-out");
    expect(cell(result, "2026-09-22").tone).toBe("none");
    expect(cell(result, "2026-09-30").blocked).toBe(true);
    expect(cell(result, "2026-09-20").label).toBe("Sunday 20 September, 1 event");
    expect(cell(result, "2026-09-30").label).toBe("Wednesday 30 September, blocked");
  });

  it("summarises the page header and the footer", () => {
    const result = render();
    expect(result.current.header.title).toBe("Calendar");
    expect(result.current.header.subtitle).toBe("September 2026 · 4 dates booked");
    expect(result.current.totals).toBe("4 dates with guests · 19 guests expected · 1 blocked");
  });

  it("is empty with nothing to show", () => {
    nav.preview = null;
    const result = render();
    expect(result.current.header.subtitle).toBe("September 2026 · 0 dates booked");
    expect(result.current.cells.every((c) => c.events.length === 0 && !c.blocked)).toBe(true);
  });

  it("moves between months", () => {
    const result = render();
    act(() => result.current.onNext());
    expect(result.current.title).toBe("October 2026");
    expect(cell(result, "2026-10-01").blocked).toBe(true);
    act(() => result.current.onPrev());
    act(() => result.current.onPrev());
    expect(result.current.title).toBe("August 2026");
  });

  it("hints at how to block dates from the header button", () => {
    const result = render();
    act(() => result.current.header.actions[0].onClick?.());
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining("press and drag"));
  });
});

describe("the week and list views", () => {
  it("shows the week, Monday to Sunday, and steps by weeks", () => {
    const result = render();
    act(() => result.current.onView("week"));

    expect(result.current.title).toBe("14 – 20 September 2026");
    expect(result.current.cells.map((c) => c.day)).toEqual([14, 15, 16, 17, 18, 19, 20]);
    expect(result.current.totals).toBe("1 date with guests · 6 guests expected · 0 blocked");

    act(() => result.current.onNext());
    expect(result.current.title).toBe("21 – 27 September 2026");
    act(() => result.current.onPrev());
    act(() => result.current.onPrev());
    expect(result.current.title).toBe("7 – 13 September 2026");
  });

  it("lists the dates with guests or blocked, in order", () => {
    const result = render();
    act(() => result.current.onView("list"));

    expect(result.current.listRows.map((r) => r.title)).toEqual(["Sun 20 Sept", "Mon 21 Sept", "Sat 26 Sept", "Sun 27 Sept", "Wed 30 Sept"]);
    expect(result.current.listRows[4]).toMatchObject({ blocked: true, events: [] });
  });
});

describe("a date", () => {
  it("opens its panel with what runs on it, and closes", () => {
    const result = render();
    act(() => result.current.onCellUp("2026-09-20"));

    expect(result.current.panel).toMatchObject({
      title: "Sunday 20 September",
      subtitle: "1 experience runs on this date",
      blocked: false,
      blockLabel: "Block this date",
    });
    expect(result.current.panel!.events[0]).toMatchObject({
      title: "Photowalk 16:00",
      note: "6 of 8 guests",
      guestListHref: "/host/dashboard/bookings",
      scanHref: "/host/dashboard/bookings/scan",
    });

    act(() => result.current.onClosePanel());
    expect(result.current.panel).toBeNull();
  });

  it("opens from the keyboard and from the list", () => {
    const result = render();
    act(() => result.current.onCellKey("2026-09-22"));
    expect(result.current.panel!.title).toBe("Tuesday 22 September");
    act(() => result.current.onOpenDay("2026-09-23"));
    expect(result.current.panel!.title).toBe("Wednesday 23 September");
  });

  it("says when nobody has booked", () => {
    const result = render();
    act(() => result.current.onCellUp("2026-09-22"));
    expect(result.current.panel).toMatchObject({ events: [], subtitle: null });
  });

  it("blocks a date, and opens it again", () => {
    const result = render();
    act(() => result.current.onCellUp("2026-09-23"));
    act(() => result.current.onToggleBlock());
    expect(cell(result, "2026-09-23").blocked).toBe(true);
    expect(result.current.panel).toMatchObject({ blocked: true, blockLabel: "Open this date again", subtitle: "Blocked. Nobody new can book this date." });
    expect(result.current.totals).toContain("2 blocked");

    act(() => result.current.onToggleBlock());
    expect(cell(result, "2026-09-23").blocked).toBe(false);
  });

  it("can open a blocked date from the sample again", () => {
    const result = render();
    act(() => result.current.onCellUp("2026-09-30"));
    act(() => result.current.onToggleBlock());
    expect(cell(result, "2026-09-30").blocked).toBe(false);
  });

  it("won't block a date that has already passed", () => {
    const result = render();
    act(() => result.current.onCellUp("2026-09-10"));
    expect(result.current.panel!.past).toBe(true);
    act(() => result.current.onToggleBlock());
    expect(cell(result, "2026-09-10").blocked).toBe(false);
  });

  it("does nothing to toggle with no date open", () => {
    const result = render();
    act(() => result.current.onToggleBlock());
    expect(result.current.totals).toContain("1 blocked");
  });
});

describe("dragging across dates", () => {
  it("highlights the stretch while dragging, then blocks it on release", () => {
    const result = render();
    act(() => result.current.onCellDown("2026-09-23"));
    act(() => result.current.onCellEnter("2026-09-25"));
    expect(["2026-09-23", "2026-09-24", "2026-09-25"].map((d) => cell(result, d).dragging)).toEqual([true, true, true]);
    expect(cell(result, "2026-09-26").dragging).toBe(false);

    act(() => result.current.onCellUp("2026-09-25"));

    expect(["2026-09-23", "2026-09-24", "2026-09-25"].map((d) => cell(result, d).blocked)).toEqual([true, true, true]);
    expect(result.current.panel).toBeNull();
    expect(cell(result, "2026-09-23").dragging).toBe(false);
  });

  it("drags backwards, skips dates already blocked and dates that have passed", () => {
    const result = render();
    act(() => result.current.onCellDown("2026-09-21"));
    act(() => result.current.onCellEnter("2026-09-17"));
    act(() => result.current.onCellUp("2026-09-17"));

    expect(cell(result, "2026-09-17").blocked).toBe(false);
    expect(cell(result, "2026-09-18").blocked).toBe(false);
    expect(["2026-09-19", "2026-09-20", "2026-09-21"].map((d) => cell(result, d).blocked)).toEqual([true, true, true]);

    // 30 September is already blocked: not added twice.
    act(() => result.current.onCellDown("2026-09-29"));
    act(() => result.current.onCellEnter("2026-10-01"));
    expect(result.current.cells.filter((c) => c.dragging)).toHaveLength(2);
    act(() => result.current.onCellUp("2026-10-01"));
    expect(result.current.totals).toContain("blocked");
  });

  it("a click without dragging opens the day instead", () => {
    const result = render();
    act(() => result.current.onCellDown("2026-09-22"));
    act(() => result.current.onCellUp("2026-09-22"));
    expect(result.current.panel!.title).toBe("Tuesday 22 September");
  });

  it("lets go of a drag that ends outside the grid", () => {
    const result = render();
    act(() => result.current.onCellDown("2026-09-23"));
    act(() => result.current.onCellEnter("2026-09-24"));
    act(() => result.current.onEndDrag());

    expect(result.current.cells.some((c) => c.dragging)).toBe(false);
    expect(cell(result, "2026-09-23").blocked).toBe(false);
  });

  it("ignores moving over dates when no drag started", () => {
    const result = render();
    act(() => result.current.onCellEnter("2026-09-24"));
    expect(result.current.cells.some((c) => c.dragging)).toBe(false);
  });
});
