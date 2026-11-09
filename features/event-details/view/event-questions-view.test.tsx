import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventQuestionsView } from "./event-questions-view";

const questions = [
  { id: "a", question: "Can I buy a ticket for a friend?", answer: "Yes, at checkout." },
  { id: "b", question: "Is there parking?", answer: "Marina car park." },
];

describe("EventQuestionsView", () => {
  it("shows only the open answer", () => {
    renderWithProviders(<EventQuestionsView questions={questions} openId="a" onToggle={vi.fn()} />);
    expect(screen.getByText("Yes, at checkout.")).toBeInTheDocument();
    expect(screen.queryByText("Marina car park.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /friend/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /parking/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("asks to open a question when it is tapped", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(<EventQuestionsView questions={questions} openId={null} onToggle={onToggle} />);
    await user.click(screen.getByRole("button", { name: /parking/ }));
    expect(onToggle).toHaveBeenCalledWith("b");
  });
});
