import { afterEach, describe, expect, it, vi } from "vitest";

import { useHostBookings } from "./bookings-data";

afterEach(() => vi.unstubAllEnvs());

describe("useHostBookings", () => {
  it("has no bookings until itin has a host API", () => {
    expect(useHostBookings(null, "2026-09-19")).toEqual([]);
  });

  it("shows the six sample bookings for ?preview=full", () => {
    expect(useHostBookings("full", "2026-09-19")).toHaveLength(6);
  });

  it("waits for today to be known, and ignores the preview in production", () => {
    expect(useHostBookings("full", null)).toEqual([]);
    vi.stubEnv("NODE_ENV", "production");
    expect(useHostBookings("full", "2026-09-19")).toEqual([]);
  });
});
