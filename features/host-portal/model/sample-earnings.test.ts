import { describe, expect, it } from "vitest";

import { sampleEarnings } from "./sample-earnings";

describe("sampleEarnings", () => {
  const data = sampleEarnings("2026-09-19");

  it("has the four headline numbers and six bookings", () => {
    expect(data.stats.map((s) => s.label)).toEqual(["Earned all time", "Clearing now", "Already paid out", "Next payout"]);
    expect(data.transactions).toHaveLength(6);
    expect(data.since).toBe("March 2026");
  });

  it("places bookings around today, the upcoming two clearing", () => {
    expect(data.transactions.filter((t) => t.status === "Clearing").map((t) => t.date)).toEqual(["2026-09-20", "2026-09-20"]);
    expect(data.transactions.find((t) => t.ref === "MJ-4431")!.date).toBe("2026-08-30");
  });
});
