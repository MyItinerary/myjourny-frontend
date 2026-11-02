import { describe, expect, it } from "vitest";

import { sampleCalendar } from "./sample-calendar";

describe("sampleCalendar", () => {
  it("places four dates with guests after today, one of them sold out, and blocks two later dates", () => {
    const { events, blocked } = sampleCalendar("2026-09-19");

    expect(events.map((e) => e.date)).toEqual(["2026-09-20", "2026-09-21", "2026-09-26", "2026-09-27"]);
    expect(events.filter((e) => e.kind === "sold-out")).toHaveLength(1);
    expect(events.reduce((sum, e) => sum + e.guests, 0)).toBe(19);
    expect(blocked).toEqual(["2026-09-30", "2026-10-01"]);
  });
});
