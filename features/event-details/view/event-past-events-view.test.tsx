import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventPastEventsView } from "./event-past-events-view";

const events = [
  { id: "p1", title: "Afro Futures Summit 2025", imageUrl: null, tone: 2 as const },
  { id: "p2", title: "Salon: Water", imageUrl: "https://img.test/w.jpg", tone: 5 as const },
];

describe("EventPastEventsView", () => {
  it("shows each past event by its title", () => {
    renderWithProviders(<EventPastEventsView events={events} />);
    expect(screen.getByRole("heading", { name: "Past events by this host" })).toBeInTheDocument();
    expect(screen.getByText("Afro Futures Summit 2025")).toBeInTheDocument();
    // No caption chips on the photos.
    expect(screen.queryByText("Round-table evening")).not.toBeInTheDocument();
    expect(screen.queryByText("Crowd in the main hall")).not.toBeInTheDocument();
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
