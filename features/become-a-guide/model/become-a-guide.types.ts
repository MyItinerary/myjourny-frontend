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

export interface ThreeStepItem {
  step: string;
  title: string;
  description: string;
  isHighlighted?: boolean;
}

export interface SampleExperienceItem {
  id: string;
  category: string;
  title: string;
  priceFormatted: string;
  guestCountFormatted: string;
  imageUrl?: string | null;
  href?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
