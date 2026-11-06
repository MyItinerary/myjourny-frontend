import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  FaqItem,
  ProfessionOption,
  SampleExperienceItem,
  ThreeStepItem,
} from "../model/become-a-guide.types";
import { BecomeAGuideView } from "./become-a-guide-view";

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer" />,
}));

const mockProfessions: ProfessionOption[] = [
  { id: "photographer", label: "Photographer", defaultPrice: 10000, defaultGroupSize: 8, defaultSessions: 4 },
];

const mockSteps: ThreeStepItem[] = [
  { step: "STEP 1", title: "Create an account", description: "Tell us what you do", isHighlighted: false },
  { step: "STEP 2", title: "We design it with you", description: "We help you shape the format", isHighlighted: true },
];

const mockSampleExperiences: SampleExperienceItem[] = [
  { id: "1", category: "PHOTOGRAPHER", title: "Photowalk", priceFormatted: "₦10,000", guestCountFormatted: "8 guests" },
];

const mockFaqItems: FaqItem[] = [
  { id: "faq-1", question: "What does it cost to list?", answer: "Nothing, and it never will." },
];

describe("BecomeAGuideView", () => {
  const defaultProps = {
    professions: mockProfessions,
    selectedProfessionId: "photographer",
    pricePerPerson: 10000,
    formattedPricePerPerson: "₦10,000",
    groupSize: 8,
    sessionsPerMonth: 4,
    earnings: {
      revenuePerSession: 80000,
      payoutPerSession: 68000,
      monthlyEarnings: 272000,
      formattedRevenue: "₦80,000",
      formattedPayout: "₦68,000",
      formattedMonthly: "₦272,000",
    },
    steps: mockSteps,
    sampleExperiences: mockSampleExperiences,
    isLoadingExperiences: false,
    faqItems: mockFaqItems,
    openFaqId: "faq-1",
    onSelectProfession: vi.fn(),
    onPriceChange: vi.fn(),
    onGroupSizeChange: vi.fn(),
    onSessionsChange: vi.fn(),
    onStartApplication: vi.fn(),
    onScrollToHowItWorks: vi.fn(),
    onToggleFaq: vi.fn(),
  };

  it("renders all major sections of the become a guide page", () => {
    render(<BecomeAGuideView {...defaultProps} />);

    // Hero section
    expect(screen.getByRole("heading", { name: /You built the audience/i })).toBeInTheDocument();

    // Calculator section
    expect(screen.getByRole("heading", { name: /Do the calculations yourself/i })).toBeInTheDocument();

    // Broadcast vs match section
    expect(screen.getByText(/Your followers are a broadcast/i)).toBeInTheDocument();

    // Value props section
    expect(screen.getByText(/Keep 85% of every booking/i)).toBeInTheDocument();

    // Three steps section
    expect(screen.getByRole("heading", { name: /Three steps\. The middle one is ours\./i })).toBeInTheDocument();

    // Sample experiences section
    expect(screen.getByRole("heading", { name: /Sample experiences/i })).toBeInTheDocument();

    // FAQ section
    expect(screen.getByRole("heading", { name: /Questions, answered/i })).toBeInTheDocument();

    // Bottom CTA section
    expect(screen.getByRole("heading", { name: /Start making money off/i })).toBeInTheDocument();
  });
});
