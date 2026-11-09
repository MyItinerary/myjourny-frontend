import type { CalculatorInputs, CalculatorOutputs, ProfessionOption } from "./become-a-guide.types";

export const PROFESSIONS: ProfessionOption[] = [
  { id: "photographer", label: "Photographer", defaultPrice: 10000, defaultGroupSize: 8, defaultSessions: 4 },
  { id: "private-chef", label: "Private chef", defaultPrice: 15000, defaultGroupSize: 6, defaultSessions: 4 },
  { id: "yoga-instructor", label: "Yoga instructor", defaultPrice: 5000, defaultGroupSize: 12, defaultSessions: 8 },
  { id: "dj", label: "DJ", defaultPrice: 20000, defaultGroupSize: 10, defaultSessions: 4 },
  { id: "makeup-artist", label: "Makeup artist", defaultPrice: 12000, defaultGroupSize: 5, defaultSessions: 6 },
  { id: "craft-practitioner", label: "Craft practitioner", defaultPrice: 8000, defaultGroupSize: 10, defaultSessions: 4 },
  { id: "boat-operator", label: "Boat operator", defaultPrice: 25000, defaultGroupSize: 8, defaultSessions: 4 },
  { id: "fitness-coach", label: "Fitness coach", defaultPrice: 6000, defaultGroupSize: 10, defaultSessions: 8 },
];

export function formatNgnCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${amount.toLocaleString()}`;
  }
}

export function calculateEarnings(inputs: CalculatorInputs): CalculatorOutputs {
  const price = Math.max(0, inputs.pricePerPerson);
  const size = Math.max(1, inputs.groupSize);
  const sessions = Math.max(1, inputs.sessionsPerMonth);

  const revenuePerSession = price * size;
  const payoutPerSession = Math.round(revenuePerSession * 0.85);
  const monthlyEarnings = payoutPerSession * sessions;

  return {
    revenuePerSession,
    payoutPerSession,
    monthlyEarnings,
    formattedRevenue: formatNgnCurrency(revenuePerSession),
    formattedPayout: formatNgnCurrency(payoutPerSession),
    formattedMonthly: formatNgnCurrency(monthlyEarnings),
  };
}
