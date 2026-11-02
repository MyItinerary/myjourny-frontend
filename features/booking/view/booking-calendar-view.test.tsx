import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingCalendarView } from "./booking-calendar-view";

const props = (over = {}) => ({
  selectedDate: new Date(2030, 5, 12),
  endDate: null,
  minDate: new Date(2030, 0, 1),
  isDateSelectable: () => true,
  dayState: () => "open" as const,
  onSelectDate: vi.fn(),
  ...over,
});

describe("BookingCalendarView", () => {
  it("shows the month of the selected day with the day picked", async () => {
    const p = props();
    const { user } = renderWithProviders(<BookingCalendarView {...p} />);

    expect(screen.getByText("June 2030")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12 June" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "13 June" }));
    expect(p.onSelectDate).toHaveBeenCalledWith(new Date(2030, 5, 13));
  });

  it("moves between months", async () => {
    const { user } = renderWithProviders(<BookingCalendarView {...props()} />);
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("July 2030")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("May 2030")).toBeInTheDocument();
  });

  it("marks few spots and sold out days, and leaves days with no times unclickable", () => {
    const dayState = (d: Date) => (d.getDate() === 14 ? "few" : d.getDate() === 15 ? "soldout" : d.getDate() === 16 ? "off" : "open");
    renderWithProviders(
      <BookingCalendarView {...props({ dayState, isDateSelectable: (d: Date) => d.getDate() !== 16 })} />,
    );

    expect(screen.getByRole("button", { name: "14 June, few spots left" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "15 June, sold out" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "16 June" })).toBeDisabled();
    expect(screen.getByText("Few spots left")).toBeInTheDocument();
    expect(screen.getByText("Sold out")).toBeInTheDocument();
    expect(screen.getByText("No times")).toBeInTheDocument();
  });

  it("fills a run of days between the start and the end", () => {
    renderWithProviders(<BookingCalendarView {...props({ selectedDate: new Date(2030, 5, 11), endDate: new Date(2030, 5, 13) })} />);

    expect(screen.getByRole("button", { name: "11 June" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "13 June" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "12 June" })).toHaveClass("bg-[#F4F2EE]");
  });

  it("disables days before the earliest", () => {
    renderWithProviders(<BookingCalendarView {...props({ minDate: new Date(2030, 5, 10) })} />);
    expect(screen.getByRole("button", { name: "9 June" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "10 June" })).toBeEnabled();
  });
});
