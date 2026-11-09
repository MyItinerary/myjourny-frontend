import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrivacyAtAGlance } from "./privacy-at-a-glance";

describe("PrivacyAtAGlance", () => {
  const mockItems = [
    {
      question: "Who is responsible for your data?",
      answer: "MyJourny is the controller.",
    },
    {
      question: "Do you sell my data?",
      answer: "No. We never sell it.",
    },
  ];

  it("renders the section title and all items with questions and answers", () => {
    render(<PrivacyAtAGlance title="At a glance" items={mockItems} />);

    expect(screen.getByRole("heading", { name: "At a glance", level: 2 })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Who is responsible for your data?", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText("MyJourny is the controller.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Do you sell my data?", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByText("No. We never sell it.")).toBeInTheDocument();
  });

  it("uses default title if none provided", () => {
    render(<PrivacyAtAGlance items={mockItems} />);

    expect(screen.getByRole("heading", { name: "At a glance", level: 2 })).toBeInTheDocument();
  });
});
