import { describe, expect, it } from "vitest";

import { calendarMonths, datePresets, describeDates, formatGuestCount, matchesQuery, matchSegments, pickRange, presetFor } from "./search-sheet";

// Friday 20 November 2026, mid-afternoon.
const NOW = new Date(2026, 10, 20, 15, 30);
const day = (d: number, m = 10) => new Date(2026, m, d);

describe("matchSegments", () => {
  it("marks the typed letters wherever they fall, ignoring case", () => {
    expect(matchSegments("Lekki", "lek")).toEqual([
      { text: "Lek", match: true },
      { text: "ki", match: false },
    ]);
    expect(matchSegments("Canoe the Lekki lagoon", "Lek")).toEqual([
      { text: "Canoe the ", match: false },
      { text: "Lek", match: true },
      { text: "ki lagoon", match: false },
    ]);
  });

  it("leaves the text whole when nothing matches", () => {
    expect(matchSegments("Yaba", "lek")).toEqual([{ text: "Yaba", match: false }]);
    expect(matchSegments("Yaba", "  ")).toEqual([{ text: "Yaba", match: false }]);
  });

  it("matchesQuery needs some typed text", () => {
    expect(matchesQuery("Victoria Island", "island")).toBe(true);
    expect(matchesQuery("Victoria Island", "")).toBe(false);
  });
});

describe("datePresets", () => {
  it("works out tonight, this weekend and next week from a Friday", () => {
    const [tonight, weekend, nextWeek, anytime] = datePresets(NOW);
    expect(tonight.range).toEqual({ start: day(20), end: day(20) });
    expect(weekend.range).toEqual({ start: day(21), end: day(22) });
    expect(nextWeek.range).toEqual({ start: day(23), end: day(29) });
    expect(anytime).toMatchObject({ label: "Anytime", range: null });
  });

  it("keeps what's left of the weekend on a Sunday, and next week starts tomorrow", () => {
    const sunday = new Date(2026, 10, 22, 10);
    const [, weekend, nextWeek] = datePresets(sunday);
    expect(weekend.range).toEqual({ start: day(22), end: day(22) });
    expect(nextWeek.range).toEqual({ start: day(23), end: day(29) });
  });

  it("from a Monday, next week is the following Monday", () => {
    const [, , nextWeek] = datePresets(new Date(2026, 10, 23, 9));
    expect(nextWeek.range?.start).toEqual(day(30));
  });

  it("names a range that is a preset, and reads others as dates", () => {
    expect(presetFor({ start: day(21), end: day(22) }, NOW)?.label).toBe("This weekend");
    expect(describeDates({ start: day(21), end: day(22) }, NOW)).toBe("This weekend");
    expect(describeDates({ start: day(7, 11), end: null }, NOW)).toBe("Mon 7 Dec");
    expect(describeDates({ start: day(24), end: day(26) }, NOW)).toBe("Tue 24 Nov – Thu 26 Nov");
    expect(describeDates({ start: null, end: null }, NOW)).toBe("");
  });
});

describe("pickRange", () => {
  it("starts on the first tap and ends on the second", () => {
    const started = pickRange({ start: null, end: null }, day(24), NOW);
    expect(started).toEqual({ start: day(24), end: null });
    expect(pickRange(started, day(26), NOW)).toEqual({ start: day(24), end: day(26) });
  });

  it("starts again on a tap before the start, or after a finished range", () => {
    expect(pickRange({ start: day(24), end: null }, day(22), NOW)).toEqual({ start: day(22), end: null });
    expect(pickRange({ start: day(24), end: day(26) }, day(28), NOW)).toEqual({ start: day(28), end: null });
  });

  it("ignores days that have gone by", () => {
    const range = { start: day(24), end: null };
    expect(pickRange(range, day(19), NOW)).toBe(range);
  });
});

describe("calendarMonths", () => {
  it("lays months out Monday first, starting with this one", () => {
    const [november, december] = calendarMonths({ start: null, end: null }, 2, NOW);
    expect(november.label).toBe("November 2026");
    expect(november.leadingBlanks).toBe(6); // 1 November 2026 is a Sunday.
    expect(november.days).toHaveLength(30);
    expect(december.label).toBe("December 2026");
    expect(december.leadingBlanks).toBe(1); // A Tuesday.
  });

  it("greys out past days and rings today", () => {
    const [november] = calendarMonths({ start: null, end: null }, 1, NOW);
    expect(november.days[18].state).toBe("past");
    expect(november.days[19].state).toBe("today");
    expect(november.days[20].state).toBe("default");
  });

  it("circles the two ends and bands the days between", () => {
    const [november] = calendarMonths({ start: day(21), end: day(24) }, 1, NOW);
    const at = (d: number) => november.days[d - 1];
    expect([at(21).selected, at(21).band]).toEqual([true, "start"]);
    expect([at(22).selected, at(22).band]).toEqual([false, "middle"]);
    expect([at(24).selected, at(24).band]).toEqual([true, "end"]);
    expect(at(25).band).toBe("none");
  });

  it("circles a lone start with no band", () => {
    const [november] = calendarMonths({ start: day(21), end: null }, 1, NOW);
    expect(november.days[20]).toMatchObject({ selected: true, band: "none" });
  });
});

it("formatGuestCount says guest or guests", () => {
  expect(formatGuestCount(1)).toBe("1 guest");
  expect(formatGuestCount(4)).toBe("4 guests");
});
