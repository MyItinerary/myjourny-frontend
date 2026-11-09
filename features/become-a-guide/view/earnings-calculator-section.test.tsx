import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProfessionOption } from "../model/become-a-guide.types";
import { EarningsCalculatorSection } from "./earnings-calculator-section";

const mockProfessions: ProfessionOption[] = [
  { id: "photographer", label: "Photographer", defaultPrice: 10000, defaultGroupSize: 8, defaultSessions: 4 },
  { id: "private-chef", label: "Private chef", defaultPrice: 25000, defaultGroupSize: 6, defaultSessions: 4 },
];

describe("EarningsCalculatorSection", () => {
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
  };

  it("renders heading and profession pills", () => {
    render(<EarningsCalculatorSection {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /Do the calculations yourself\./i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Photographer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Private chef" })).toBeInTheDocument();
  });

  it("handles profession selection and slider inputs", () => {
    render(<EarningsCalculatorSection {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Private chef" }));
    expect(defaultProps.onSelectProfession).toHaveBeenCalledWith("private-chef");

    const priceSlider = screen.getByLabelText("Price per person");
    fireEvent.change(priceSlider, { target: { value: "15000" } });
    expect(defaultProps.onPriceChange).toHaveBeenCalledWith(15000);
  });
});
