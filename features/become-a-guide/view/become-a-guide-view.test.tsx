import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProfessionOption } from "../model/become-a-guide.types";
import { BecomeAGuideView } from "./become-a-guide-view";

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer" />,
}));

const mockProfessions: ProfessionOption[] = [
  { id: "photographer", label: "Photographer", defaultPrice: 10000, defaultGroupSize: 8, defaultSessions: 4 },
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
    onSelectProfession: vi.fn(),
    onPriceChange: vi.fn(),
    onGroupSizeChange: vi.fn(),
    onSessionsChange: vi.fn(),
    onStartApplication: vi.fn(),
    onScrollToHowItWorks: vi.fn(),
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
  });
});
