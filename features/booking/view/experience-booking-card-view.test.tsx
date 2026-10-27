import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperienceBookingCardProps } from "../view-model/use-experience-booking-card-view-model";
import { ExperienceBookingCardView } from "./experience-booking-card-view";

function card(overrides: Partial<ExperienceBookingCardProps> = {}): ExperienceBookingCardProps {
  return {
    price: { prefix: null, amount: "₦16,000", unit: "per person" },
    durationLabel: "2.5 hours",
    scheduleLabel: "Every Saturday · 3 days",
    sessions: {
      scheduled: true,
      timezoneNote: "Times are Lagos time.",
      noSessions: false,
      allSoldOut: false,
      openDayCount: 3,
      options: [
        { startsAt: "a", label: "6:00am", note: null, disabled: false, selected: false },
        { startsAt: "b", label: "7:00am", note: "3 left", disabled: false, selected: true },
        { startsAt: "c", label: "9:00am", note: "Sold out", disabled: true, selected: false },
      ],
      session: null,
      request: null,
      lengthDays: 1,
      selectedDate: null,
      dateLabel: "June 13",
      minDate: new Date(2030, 0, 1),
      isDateSelectable: () => true,
      onSelectDate: vi.fn(),
      onPickSession: vi.fn(),
    },
    guests: [{ id: "t", label: "Guests", sublabel: null, quantity: 2, max: 8, onChange: vi.fn() }],
    notices: [],
    days: { show: false, value: 1, onChange: vi.fn() },
    addons: [],
    promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: null },
    total: { amount: "₦32,000", hint: null, note: "Fees and taxes included" },
    action: { label: "Book now", disabled: false, pending: false, onClick: vi.fn() },
    info: [{ id: "c", icon: "cancellation", title: "Free cancellation", body: "Until Friday 11 September." }],
    ...overrides,
  };
}

describe("ExperienceBookingCardView", () => {
  it("lays out price, date with duration, times, guests, total, button and policy", () => {
    renderWithProviders(<ExperienceBookingCardView {...card()} />);
    expect(screen.getByText("₦16,000")).toBeInTheDocument();
    expect(screen.getByText("Every Saturday · 3 days")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose a date" })).toHaveTextContent("June 13 · 2.5 hours");
    expect(screen.getByText("Choose a time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /7:00am/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /9:00am/ })).toBeDisabled();
    expect(screen.getByText("₦32,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book now" })).toBeEnabled();
    expect(screen.getByText("Free cancellation")).toBeInTheDocument();
  });

  it("picks a time and steps the guests", async () => {
    const view = card();
    const { user } = renderWithProviders(<ExperienceBookingCardView {...view} />);
    await user.click(screen.getByRole("button", { name: "6:00am" }));
    expect(view.sessions.onPickSession).toHaveBeenCalledWith("a");
    await user.click(screen.getByRole("button", { name: "Increase Guests" }));
    expect(view.guests[0].onChange).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole("button", { name: "Decrease Guests" }));
    expect(view.guests[0].onChange).toHaveBeenCalledWith(1);
  });

  it("stops the guests at the maximum", () => {
    renderWithProviders(
      <ExperienceBookingCardView
        {...card({ guests: [{ id: "t", label: "Guests", sublabel: null, quantity: 8, max: 8, onChange: vi.fn() }] })}
      />,
    );
    expect(screen.getByRole("button", { name: "Increase Guests" })).toBeDisabled();
  });

  it("books through the button", async () => {
    const view = card();
    const { user } = renderWithProviders(<ExperienceBookingCardView {...view} />);
    await user.click(screen.getByRole("button", { name: "Book now" }));
    expect(view.action?.onClick).toHaveBeenCalled();
  });

  it("explains an unscheduled or empty experience instead of showing times", () => {
    const base = card().sessions;
    const { rerender } = renderWithProviders(
      <ExperienceBookingCardView {...card({ sessions: { ...base, scheduled: false, options: [] } })} />,
    );
    expect(screen.getByText(/The host will confirm the start time/)).toBeInTheDocument();
    rerender(<ExperienceBookingCardView {...card({ sessions: { ...base, noSessions: true, options: [] } })} />);
    expect(screen.getByText("No upcoming sessions yet. Check back soon.")).toBeInTheDocument();
  });

  it("shows the muted total hint and notices, and says when it can't be booked", () => {
    renderWithProviders(
      <ExperienceBookingCardView
        {...card({
          total: { amount: null, hint: "Select a time", note: null },
          notices: ["Only 1 spot left for this session."],
          action: null,
        })}
      />,
    );
    expect(screen.getByText("Select a time")).toBeInTheDocument();
    expect(screen.getByText("Only 1 spot left for this session.")).toBeInTheDocument();
    expect(screen.getByText(/isn't available for booking yet/)).toBeInTheDocument();
  });

  it("shows days and extras when the experience has them", () => {
    renderWithProviders(
      <ExperienceBookingCardView
        {...card({
          days: { show: true, value: 2, onChange: vi.fn() },
          addons: [{ id: "l", label: "Lunch", priceLabel: "₦1,500", checked: false, onToggle: vi.fn() }],
        })}
      />,
    );
    expect(screen.getByRole("button", { name: "Increase days" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Lunch/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Have a promo code?" })).toBeInTheDocument();
  });

  it("has no time chips for a day with one start time, and shows that time in the date field", () => {
    const base = card().sessions;
    renderWithProviders(
      <ExperienceBookingCardView
        {...card({
          sessions: {
            ...base,
            options: [{ startsAt: "a", label: "9:00 AM", note: "3 left", disabled: false, selected: true }],
          },
        })}
      />,
    );
    expect(screen.queryByText("Choose a time")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /9:00 AM$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choose a date" })).toHaveTextContent("June 13 · 9:00 AM · 2.5 hours");
    expect(screen.getByText("3 left. Times are Lagos time.")).toBeInTheDocument();
  });

  it("has no date picker when only one day is bookable, but still lets you pick among its times", () => {
    renderWithProviders(
      <ExperienceBookingCardView {...card({ sessions: { ...card().sessions, openDayCount: 1 } })} />,
    );
    expect(screen.queryByRole("button", { name: "Choose a date" })).not.toBeInTheDocument();
    expect(screen.getByTestId("fixed-date")).toHaveTextContent("June 13 · 2.5 hours");
    expect(screen.getByText("Choose a time")).toBeInTheDocument();
  });

  it("shows a single fixed date and time as plain text, with no pickers at all", () => {
    const base = card().sessions;
    renderWithProviders(
      <ExperienceBookingCardView
        {...card({
          sessions: {
            ...base,
            openDayCount: 1,
            options: [{ startsAt: "a", label: "9:00 AM", note: null, disabled: false, selected: true }],
          },
        })}
      />,
    );
    expect(screen.getByTestId("fixed-date")).toHaveTextContent("June 13 · 9:00 AM · 2.5 hours");
    expect(screen.queryByRole("button", { name: "Choose a date" })).not.toBeInTheDocument();
    expect(screen.queryByText("Choose a time")).not.toBeInTheDocument();
  });
});
