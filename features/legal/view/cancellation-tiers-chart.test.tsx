import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CancellationTiersChart } from "./cancellation-tiers-chart";

describe("CancellationTiersChart", () => {
  it("renders the 3 cancellation policies with labels and badges", () => {
    render(<CancellationTiersChart />);

    expect(screen.getByText("Flexible")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Strict")).toBeInTheDocument();
  });

  it("renders timeline tick labels", () => {
    render(<CancellationTiersChart />);

    expect(screen.getByText("When you book")).toBeInTheDocument();
    expect(screen.getByText("7 days")).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    expect(screen.getByText("24 hours")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
  });

  it("renders refund status segments", () => {
    render(<CancellationTiersChart />);

    const fullRefunds = screen.getAllByText("Full refund");
    expect(fullRefunds.length).toBe(3);

    const fiftyPercentRefunds = screen.getAllByText("50% refund");
    expect(fiftyPercentRefunds.length).toBe(2);

    const noRefunds = screen.getAllByText("No refund");
    expect(noRefunds.length).toBe(3);
  });
});
