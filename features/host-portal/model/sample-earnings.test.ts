import { describe, expect, it } from "vitest";

import { sampleEarnings } from "./sample-earnings";

describe("sampleEarnings", () => {
  const data = sampleEarnings("2026-09-19");

  it("has ledger totals and six booking lines", () => {
    expect(data.totals).toEqual([{ currency: "NGN", earned: "1046000.00", pending: "68000.00", paid_out: "978000.00" }]);
    expect(data.bookings).toHaveLength(6);
  });

  it("places bookings around today, the upcoming two clearing", () => {
    expect(data.bookings.filter((booking) => booking.payout_status === "pending").map((booking) => booking.session_at?.slice(0, 10))).toEqual(["2026-09-20", "2026-09-20"]);
    expect(data.bookings.find((booking) => booking.booking_id === "MJ-4431")!.session_at?.slice(0, 10)).toBe("2026-08-30");
  });
});
