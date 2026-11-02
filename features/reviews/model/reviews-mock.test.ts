import { describe, expect, it } from "vitest";

import { MOCK_RATING_BREAKDOWN, MOCK_REVIEW_RATING, MOCK_REVIEW_SUMMARY, MOCK_REVIEW_TOTAL, MOCK_REVIEWS } from "./reviews-mock";

describe("sample reviews", () => {
  it("has a score, a breakdown, a summary and reviews that cover each design variant", () => {
    expect(MOCK_REVIEW_RATING).toBeGreaterThan(0);
    expect(MOCK_REVIEW_TOTAL).toBeGreaterThanOrEqual(MOCK_REVIEWS.length);
    expect(MOCK_REVIEW_SUMMARY).not.toBe("");
    expect(MOCK_RATING_BREAKDOWN.map((row) => row.label)).toEqual(["Host", "Value", "Organisation"]);
    expect(MOCK_REVIEWS.some((r) => r.host_reply)).toBe(true);
    expect(MOCK_REVIEWS.some((r) => (r.comment?.length ?? 0) > 240)).toBe(true);
    expect(new Set(MOCK_REVIEWS.map((r) => r.id)).size).toBe(MOCK_REVIEWS.length);
  });
});
