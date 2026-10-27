import { describe, expect, it } from "vitest";

import { SAMPLE_REVIEWS } from "./sample-reviews";

describe("SAMPLE_REVIEWS", () => {
  it("is a complete set the reviews section can render", () => {
    expect(SAMPLE_REVIEWS.count).toBeGreaterThanOrEqual(SAMPLE_REVIEWS.reviews.length);
    expect(SAMPLE_REVIEWS.breakdown.map((row) => row.label)).toEqual(["Host", "Value", "Organisation"]);
    for (const review of SAMPLE_REVIEWS.reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
    }
    expect(new Set(SAMPLE_REVIEWS.reviews.map((r) => r.id)).size).toBe(SAMPLE_REVIEWS.reviews.length);
  });
});
