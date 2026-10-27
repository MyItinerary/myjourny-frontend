import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventPastEventsView } from "./event-past-events-view";

const events = [
  { id: "p1", title: "Afro Futures Summit 2025", caption: "Crowd in the main hall", imageUrl: null, tone: 2 as const },
  { id: "p2", title: "Salon: Water", caption: "Round-table evening", imageUrl: "https://img.test/w.jpg", tone: 5 as const },
];

describe("EventPastEventsView", () => {
  it("shows each past event with its caption", () => {
    renderWithProviders(<EventPastEventsView events={events} />);
    expect(screen.getByRole("heading", { name: "Past events" })).toBeInTheDocument();
    expect(screen.getByText("Afro Futures Summit 2025")).toBeInTheDocument();
    expect(screen.getByText("Round-table evening")).toBeInTheDocument();
  });

  it("scrolls the row with the arrows", async () => {
    const scrollBy = vi.fn();
    Element.prototype.scrollBy = scrollBy;
    const { user } = renderWithProviders(<EventPastEventsView events={events} />);
    await user.click(screen.getByRole("button", { name: "Next events" }));
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 259 }));
    await user.click(screen.getByRole("button", { name: "Previous events" }));
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -259 }));
  });
});
