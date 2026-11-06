import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { FaqItem } from "../model/become-a-guide.types";
import { FaqSection } from "./faq-section";

const mockItems: FaqItem[] = [
  { id: "cost", question: "What does it cost to list?", answer: "Nothing, and it never will." },
  { id: "payout", question: "When do I get paid?", answer: "24 hours after the experience." },
];

describe("FaqSection", () => {
  it("renders heading and question list with open state", () => {
    const onToggle = vi.fn();
    render(<FaqSection items={mockItems} openId="cost" onToggle={onToggle} />);

    expect(screen.getByRole("heading", { name: /Questions, answered/i })).toBeInTheDocument();
    expect(screen.getByText("What does it cost to list?")).toBeInTheDocument();
    expect(screen.getByText("Nothing, and it never will.")).toBeInTheDocument();

    const secondQuestion = screen.getByText("When do I get paid?");
    fireEvent.click(secondQuestion);
    expect(onToggle).toHaveBeenCalledWith("payout");
  });
});
