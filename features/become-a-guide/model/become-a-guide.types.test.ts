import { describe, expect, it } from "vitest";

import type {
  CalculatorInputs,
  CalculatorOutputs,
  FaqItem,
  ProfessionOption,
  SampleExperienceItem,
  ThreeStepItem,
} from "./become-a-guide.types";

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
    const step: ThreeStepItem = {
      step: "STEP 1",
      title: "Create an account",
      description: "About 10 minutes",
      isHighlighted: false,
    };
    const sampleExp: SampleExperienceItem = {
      id: "sample-1",
      category: "PHOTOGRAPHER",
      title: "Photowalk",
      priceFormatted: "₦10,000",
      guestCountFormatted: "8 guests",
    };
    const faq: FaqItem = {
      id: "faq-1",
      question: "What does it cost to list?",
      answer: "Nothing, and it never will.",
    };

    expect(inputs.pricePerPerson).toBe(10000);
    expect(outputs.monthlyEarnings).toBe(272000);
    expect(option.label).toBe("Photographer");
    expect(step.step).toBe("STEP 1");
    expect(sampleExp.category).toBe("PHOTOGRAPHER");
    expect(faq.question).toBe("What does it cost to list?");
  });
});
