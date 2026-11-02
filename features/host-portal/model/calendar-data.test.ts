import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostCalendar } from "./calendar-data";

afterEach(() => vi.unstubAllEnvs());

describe("useHostCalendar", () => {
  it("has nothing until itin has a host API", () => {
    expect(useHostCalendar(null, "2026-09-19")).toEqual({ events: [], initialBlocked: [] });
  });

  it("fills in the design's sample dates for ?preview=full", () => {
    const { events, initialBlocked } = useHostCalendar("full", "2026-09-19");
    expect(events).toHaveLength(4);
    expect(initialBlocked).toHaveLength(2);
  });

  it("waits for today to be known, and ignores the preview in production", () => {
    expect(useHostCalendar("full", null).events).toEqual([]);
    vi.stubEnv("NODE_ENV", "production");
    expect(useHostCalendar("full", "2026-09-19").events).toEqual([]);
  });
});
