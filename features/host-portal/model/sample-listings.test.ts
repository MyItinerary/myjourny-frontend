import { describe, expect, it } from "vitest";

import { STATUS_OPTIONS } from "./listing-table";
import { SAMPLE_LISTINGS } from "./sample-listings";

describe("SAMPLE_LISTINGS", () => {
  it("has eight listings, one in every status", () => {
    expect(SAMPLE_LISTINGS).toHaveLength(8);
    expect(SAMPLE_LISTINGS.map((l) => l.status).sort()).toEqual([...STATUS_OPTIONS].sort());
  });

  it("has unique ids and a price on each", () => {
    expect(new Set(SAMPLE_LISTINGS.map((l) => l.id)).size).toBe(8);
    expect(SAMPLE_LISTINGS.every((l) => l.price > 0)).toBe(true);
  });

  it("blocks deleting only listings with bookings still to come", () => {
    expect(SAMPLE_LISTINGS.filter((l) => l.future > 0).map((l) => l.status).sort()).toEqual(["Hidden", "Live", "Sold out"]);
  });
});
