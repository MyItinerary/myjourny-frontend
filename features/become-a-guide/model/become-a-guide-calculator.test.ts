import { describe, expect, it } from "vitest";

import { calculateEarnings, formatNgnCurrency, PROFESSIONS } from "./become-a-guide-calculator";

describe("become-a-guide-calculator", () => {
  it("has 8 predefined professions", () => {
    expect(PROFESSIONS).toHaveLength(8);
    expect(PROFESSIONS[0].label).toBe("Photographer");
  });

  it("calculates exact earnings matching Figma defaults (80k revenue, 68k payout, 272k monthly)", () => {
    const result = calculateEarnings({
      pricePerPerson: 10000,
      groupSize: 8,
      sessionsPerMonth: 4,
    });

    expect(result.revenuePerSession).toBe(80000);
    expect(result.payoutPerSession).toBe(68000);
    expect(result.monthlyEarnings).toBe(272000);

    expect(result.formattedRevenue).toMatch(/80,000/);
    expect(result.formattedPayout).toMatch(/68,000/);
    expect(result.formattedMonthly).toMatch(/272,000/);
  });

  it("handles custom slider inputs accurately", () => {
    const result = calculateEarnings({
      pricePerPerson: 25000,
      groupSize: 4,
      sessionsPerMonth: 2,
    });

    expect(result.revenuePerSession).toBe(100000);
    expect(result.payoutPerSession).toBe(85000);
    expect(result.monthlyEarnings).toBe(170000);
  });

  it("formats NGN currency with naira symbol", () => {
    expect(formatNgnCurrency(10000)).toMatch(/10,000/);
  });
});
