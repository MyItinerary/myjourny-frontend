import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ThreeStepItem } from "../model/become-a-guide.types";
import { ThreeStepsSection } from "./three-steps-section";

const mockSteps: ThreeStepItem[] = [
  {
    step: "STEP 1",
    title: "Create an account",
    description: "Tell us what you do and who you are.",
    isHighlighted: false,
  },
  {
    step: "STEP 2 - THE PART MOST PEOPLE FEAR",
    title: "We design it with you",
    description: "We help you shape the format, the price, and the pitch.",
    isHighlighted: true,
  },
  {
    step: "STEP 3",
    title: "Go live and get paid",
    description: "Guests book and pay through us.",
    isHighlighted: false,
  },
];

describe("ThreeStepsSection", () => {
  it("renders heading and all 3 step cards", () => {
    render(<ThreeStepsSection steps={mockSteps} />);

    expect(
      screen.getByRole("heading", { name: /Three steps\. The middle one is ours\./i })
    ).toBeInTheDocument();
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByText("We design it with you")).toBeInTheDocument();
    expect(screen.getByText("Go live and get paid")).toBeInTheDocument();
    expect(screen.getByText("STEP 2 - THE PART MOST PEOPLE FEAR")).toBeInTheDocument();
  });
});
