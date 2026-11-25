import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ValuePropsSection } from "./value-props-section";

describe("ValuePropsSection", () => {
  it("renders 3 value proposition cards and headings", () => {
    render(<ValuePropsSection />);

    expect(screen.getByText(/Keep 85% of every booking\./i)).toBeInTheDocument();
    expect(screen.getByText("You keep 85%")).toBeInTheDocument();
    expect(screen.getByText("Transparent fee pricing")).toBeInTheDocument();

    expect(screen.getByText("Paid in 24h")).toBeInTheDocument();
    expect(screen.getByText("24h payout")).toBeInTheDocument();

    expect(screen.getByText("No paid placement")).toBeInTheDocument();
    expect(screen.getByText("Nothing hidden")).toBeInTheDocument();
  });
});
