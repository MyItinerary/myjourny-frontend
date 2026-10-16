import { describe, expect, it } from "vitest";

import { BANNER_TONE, capitalise, dateFill, payout, stars } from "./listing-detail";

describe("payout", () => {
  it("takes our 15 percent from a full group", () => {
    expect(payout({ guests: 8, price: 10000 })).toEqual({
      line: "8 guests at ₦10,000", gross: "₦80,000", commission: "₦12,000", net: "₦68,000", percent: 15,
    });
  });
});

describe("dateFill", () => {
  it("describes empty, partly booked and sold out dates", () => {
    expect(dateFill(0, 8)).toMatchObject({ full: false, percent: 0, seats: "No bookings yet, 8 places free" });
    expect(dateFill(6, 8)).toMatchObject({ full: false, percent: 75, seats: "6 of 8 booked" });
    expect(dateFill(5, 5)).toMatchObject({ full: true, percent: 100, seats: "All 5 places taken" });
  });
});

describe("small helpers", () => {
  it("capitalises and draws stars", () => {
    expect(capitalise("the yellow gate")).toBe("The yellow gate");
    expect(stars(4)).toBe("★★★★");
  });

  it("gives every banner a tone", () => {
    expect(BANNER_TONE.rejected).toBe("red");
    expect(BANNER_TONE.soldout).toBe("blue");
  });
});
