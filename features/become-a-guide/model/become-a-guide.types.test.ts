import { describe, expect, it } from "vitest";

import type { CalculatorInputs, CalculatorOutputs, ProfessionOption } from "./become-a-guide.types";

describe("become-a-guide.types", () => {
  it("allows constructing valid typed models", () => {
    const inputs: CalculatorInputs = {
      pricePerPerson: 10000,
      groupSize: 8,
      sessionsPerMonth: 4,
    };
    const outputs: CalculatorOutputs = {
      revenuePerSession: 80000,
      payoutPerSession: 68000,
      monthlyEarnings: 272000,
      formattedRevenue: "₦80,000",
      formattedPayout: "₦68,000",
      formattedMonthly: "₦272,000",
    };
    const option: ProfessionOption = {
      id: "photographer",
      label: "Photographer",
      defaultPrice: 10000,
      defaultGroupSize: 8,
      defaultSessions: 4,
    };

    expect(inputs.pricePerPerson).toBe(10000);
    expect(outputs.monthlyEarnings).toBe(272000);
    expect(option.label).toBe("Photographer");
  });
});
