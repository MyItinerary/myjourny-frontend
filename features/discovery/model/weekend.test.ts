import { describe, expect, it } from "vitest";

import { nextSaturday } from "./weekend";

describe("nextSaturday", () => {
  it("finds the coming Saturday from midweek", () => {
    expect(nextSaturday(new Date(2026, 10, 4))).toBe("2026-11-07");
  });

  it("returns today when it is Saturday", () => {
    expect(nextSaturday(new Date(2026, 10, 7))).toBe("2026-11-07");
  });

  it("rolls over the month", () => {
    expect(nextSaturday(new Date(2026, 10, 29))).toBe("2026-12-05");
  });
});
