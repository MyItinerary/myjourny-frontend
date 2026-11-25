import { describe, expect, it } from "vitest";

import { POPULAR_LOCATIONS } from "./popular-locations";

describe("POPULAR_LOCATIONS", () => {
  it("offers places across Nigeria, each named once and pinned inside the country", () => {
    const names = POPULAR_LOCATIONS.map((l) => l.name);
    expect(names).toContain("Lekki Phase 1");
    expect(names).toContain("Abeokuta");
    expect(new Set(names).size).toBe(names.length);
    for (const l of POPULAR_LOCATIONS) {
      expect(l.lat).toBeGreaterThan(4);
      expect(l.lat).toBeLessThan(14);
      expect(l.lng).toBeGreaterThan(2.5);
      expect(l.lng).toBeLessThan(15);
      expect(l.city).toBeTruthy();
    }
  });
});
