import { describe, expect, it } from "vitest";

import {
  addDays,
  dateKey,
  datesBetween,
  longDate,
  monthCells,
  monthTitle,
  parseKey,
  shortDate,
  totalsFor,
  totalsLine,
  weekCells,
  weekStart,
  weekTitle,
} from "./calendar";
import type { CalendarEvent } from "./calendar.types";

describe("dates", () => {
  it("round-trips a key", () => {
    expect(dateKey(parseKey("2026-09-19"))).toBe("2026-09-19");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-09-29", 3)).toBe("2026-10-02");
    expect(addDays("2026-10-02", -3)).toBe("2026-09-29");
  });

  it("finds the Monday of a week", () => {
    expect(weekStart("2026-09-19")).toBe("2026-09-14"); // a Saturday
    expect(weekStart("2026-09-14")).toBe("2026-09-14");
    expect(weekStart("2026-09-20")).toBe("2026-09-14"); // a Sunday
  });

  it("lists the days between two dates, either way round", () => {
    expect(datesBetween("2026-09-08", "2026-09-10")).toEqual(["2026-09-08", "2026-09-09", "2026-09-10"]);
    expect(datesBetween("2026-09-10", "2026-09-08")).toEqual(["2026-09-08", "2026-09-09", "2026-09-10"]);
    expect(datesBetween("2026-09-08", "2026-09-08")).toEqual(["2026-09-08"]);
  });

  it("words dates", () => {
    expect(longDate("2026-09-19")).toBe("Saturday 19 September");
    expect(shortDate("2026-09-19")).toBe("Sat 19 Sept");
    expect(shortDate("2026-10-03")).toBe("Sat 3 Oct");
    expect(monthTitle(2026, 8)).toBe("September 2026");
    expect(weekTitle("2026-09-14")).toBe("14 – 20 September 2026");
    expect(weekTitle("2026-09-28")).toBe("28 September – 4 October 2026");
  });
});

describe("monthCells", () => {
  it("starts on Monday: September 2026 begins on a Tuesday, so one blank first", () => {
    const cells = monthCells(2026, 8);
    expect(cells[0]).toEqual({ date: null, day: null });
    expect(cells[1]).toEqual({ date: "2026-09-01", day: 1 });
    expect(cells.filter((c) => c.date)).toHaveLength(30);
  });

  it("is whole weeks, five or six", () => {
    expect(monthCells(2026, 8)).toHaveLength(35);
    expect(monthCells(2027, 1)).toHaveLength(28); // February 2027 starts on a Monday
    expect(monthCells(2026, 1)).toHaveLength(35); // February 2026 starts on a Sunday
    expect(monthCells(2026, 2).length % 7).toBe(0);
  });

  it("starts the 1st in the first square when the month begins on a Monday", () => {
    expect(monthCells(2026, 5)[0]).toEqual({ date: "2026-06-01", day: 1 });
  });
});

describe("weekCells", () => {
  it("is seven days from the start", () => {
    const cells = weekCells("2026-09-28");
    expect(cells.map((c) => c.date)).toEqual([
      "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04",
    ]);
    expect(cells[3].day).toBe(1);
  });
});

describe("totals", () => {
  const events: CalendarEvent[] = [
    { id: "a", date: "2026-09-20", title: "Walk", note: null, kind: "booked", guests: 6 },
    { id: "b", date: "2026-09-20", title: "Late walk", note: null, kind: "booked", guests: 2 },
    { id: "c", date: "2026-09-21", title: "Boat", note: null, kind: "sold-out", guests: 5 },
  ];

  it("counts dates, guests and blocked dates", () => {
    expect(totalsFor(events, ["2026-09-08"])).toEqual({ datesWithGuests: 2, guests: 13, blocked: 1 });
    expect(totalsLine({ datesWithGuests: 4, guests: 19, blocked: 2 })).toBe("4 dates with guests · 19 guests expected · 2 blocked");
    expect(totalsLine({ datesWithGuests: 1, guests: 1, blocked: 0 })).toBe("1 date with guests · 1 guest expected · 0 blocked");
  });
});
