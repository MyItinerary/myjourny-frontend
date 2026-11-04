import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EnforcementStepsCard } from "./enforcement-steps-card";

describe("EnforcementStepsCard", () => {
  const mockSteps = [
    {
      number: 1,
      title: "Reminder",
      description: "A note explaining what went wrong.",
    },
    {
      number: 2,
      title: "Remove",
      description: "We close your account.",
      isHighlighted: true,
    },
  ];

  it("renders all steps with titles and descriptions", () => {
    render(<EnforcementStepsCard steps={mockSteps} />);

    expect(screen.getByText("Reminder")).toBeInTheDocument();
    expect(screen.getByText("A note explaining what went wrong.")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
    expect(screen.getByText("We close your account.")).toBeInTheDocument();
  });
});
