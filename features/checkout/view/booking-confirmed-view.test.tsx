import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingConfirmation } from "../model/booking-confirmation.types";
import { BookingConfirmedView } from "./booking-confirmed-view";

const confirmation: BookingConfirmation = {
  title: "Kayaking",
  imageUrl: "/kayak.jpg",
  dateLabel: "July 16th, 2026",
  guestsLabel: "1 guest",
  totalLabel: "₦10,000.00",
  viewHref: "/bookings/b-1",
  calendarHref: "https://calendar.google.com/calendar/render?action=TEMPLATE",
};

describe("BookingConfirmedView", () => {
  it("tells them they're going, with links to the booking and their calendar", () => {
    renderWithProviders(<BookingConfirmedView confirmation={confirmation} />);

    expect(screen.getByRole("heading", { name: "You’re going!" })).toBeInTheDocument();
    expect(screen.getByText("View booking").closest("a")).toHaveAttribute("href", "/bookings/b-1");
    expect(screen.getByText("Add to calendar").closest("a")).toHaveAttribute("href", confirmation.calendarHref);
    expect(screen.getAllByText("Kayaking").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₦10,000.00 total").length).toBeGreaterThan(0);
  });

  it("leaves out the calendar and total when unknown", () => {
    renderWithProviders(
      <BookingConfirmedView confirmation={{ ...confirmation, calendarHref: null, totalLabel: null, imageUrl: null }} />,
    );
    expect(screen.queryByText("Add to calendar")).not.toBeInTheDocument();
    expect(screen.queryByText(/total/)).not.toBeInTheDocument();
  });

  it("opens the booking bar on a phone", async () => {
    const { user } = renderWithProviders(<BookingConfirmedView confirmation={confirmation} />);
    const before = screen.getAllByText("Kayaking").length;

    await user.click(screen.getByRole("button", { name: "Show booking" }));
    expect(screen.getAllByText("Kayaking").length).toBeGreaterThan(before);

    await user.click(screen.getByRole("button", { name: "Hide booking" }));
    expect(screen.getAllByText("Kayaking").length).toBe(before);
  });
});
