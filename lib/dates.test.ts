import { describe, expect, it } from "vitest";

import { formatDateRange } from "./dates";

describe("formatDateRange", () => {
  it("formats a range, a single day and nothing", () => {
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) })).toBe("12 Nov – 21 Nov");
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: new Date(2030, 10, 12) })).toBe("12 Nov");
    expect(formatDateRange({ start: new Date(2030, 10, 12), end: null })).toBe("12 Nov");
    expect(formatDateRange({ start: null, end: null })).toBe("");
  });
});
