import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SampleExperienceItem } from "../model/become-a-guide.types";
import { SampleExperiencesSection } from "./sample-experiences-section";

const mockExperiences: SampleExperienceItem[] = [
  {
    id: "sample-photographer",
    category: "PHOTOGRAPHER",
    title: "Neighbourhood photowalk",
    priceFormatted: "₦10,000",
    guestCountFormatted: "8 guests",
  },
  {
    id: "sample-private-chef",
    category: "PRIVATE CHEF",
    title: "Supper club for strangers",
    priceFormatted: "₦28,000",
    guestCountFormatted: "10 guests",
  },
];

describe("SampleExperiencesSection", () => {
  it("renders heading and experience cards with category and price", () => {
    render(<SampleExperiencesSection experiences={mockExperiences} />);

    expect(
      screen.getByRole("heading", { name: /Sample experiences/i })
    ).toBeInTheDocument();
    expect(screen.getByText("PHOTOGRAPHER")).toBeInTheDocument();
    expect(screen.getByText("Neighbourhood photowalk")).toBeInTheDocument();
    expect(screen.getByText("₦10,000 · 8 guests")).toBeInTheDocument();
    expect(screen.getByText("PRIVATE CHEF")).toBeInTheDocument();
    expect(screen.getByText("Supper club for strangers")).toBeInTheDocument();
  });

  it("renders skeletons when loading with no experiences", () => {
    render(<SampleExperiencesSection experiences={[]} isLoading />);
    expect(screen.getAllByTestId("sample-experience-skeleton")).toHaveLength(8);
  });
});
