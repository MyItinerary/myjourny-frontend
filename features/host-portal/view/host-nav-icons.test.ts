import { describe, expect, it } from "vitest";

import { HOST_NAV_ICONS } from "./host-nav-icons";

describe("HOST_NAV_ICONS", () => {
  it("has a glyph for each of the seven destinations", () => {
    expect(Object.keys(HOST_NAV_ICONS).sort()).toEqual(["book", "cal", "dash", "earn", "help", "list", "prof"]);
  });

  it("keeps each outline intact: closed contours, a transform, full coordinate precision", () => {
    for (const [name, { d, transform }] of Object.entries(HOST_NAV_ICONS)) {
      // Only path commands and numbers: nothing was lost or mangled in transit.
      expect(d, name).toMatch(/^[MLCZ\d\s.-]+$/);
      expect(d.startsWith("M "), name).toBe(true);
      expect(d.trim().endsWith("Z"), name).toBe(true);
      expect(transform, name).toMatch(/^matrix\(1 0 0 1 [\d.]+ [\d.]+\)$/);
      // Rounded coordinates collapse the ribbon between the outer and inner contour.
      expect(d, name).toMatch(/\d\.\d{3}/);
    }
  });
});
