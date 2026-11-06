export interface ProfessionOption {
  id: string;
  label: string;
  defaultPrice: number;
  defaultGroupSize: number;
  defaultSessions: number;
}

export interface CalculatorInputs {
  pricePerPerson: number;
  groupSize: number;
  sessionsPerMonth: number;
}

export interface CalculatorOutputs {
  revenuePerSession: number;
  payoutPerSession: number;
  monthlyEarnings: number;
  formattedRevenue: string;
  formattedPayout: string;
  formattedMonthly: string;
}
