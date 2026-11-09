import { describe, expect, it } from "vitest";

import { formatDateRange, parseIsoDay, toIsoDay } from "./dates";

describe("formatDateRange", () => {
  it("formats a range, a single day and nothing", () => {
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) })).toBe("12 Nov – 21 Nov");
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 12) })).toBe("12 Nov");
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: null })).toBe("12 Nov");
    expect(formatDateRange({ start: null, end: null })).toBe("");
  });
});

describe("ISO days", () => {
  it("writes and reads a local day", () => {
    expect(toIsoDay(new Date(2030, 0, 5))).toBe("2030-01-05");
    expect(parseIsoDay("2030-01-05")).toEqual(new Date(2030, 0, 5));
  });

  it("refuses what isn't a real day", () => {
    expect(parseIsoDay("2030-02-31")).toBeNull();
    expect(parseIsoDay("soon")).toBeNull();
    expect(parseIsoDay(null)).toBeNull();
  });
});
