import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingPanelViewModel } from "../view-model/use-booking-panel-view-model";
import type { SessionChoice } from "../view-model/use-session-choice";
import { BookingPanelView } from "./booking-panel-view";

function sessionChoice(overrides: Partial<SessionChoice> = {}): SessionChoice {
  return {
    scheduled: true,
    timezoneNote: "Times are Lagos time.",
    noSessions: false,
    allSoldOut: false,
    options: [
      { startsAt: "a", label: "9:00 AM", note: "2 left", disabled: false, selected: true },
      { startsAt: "b", label: "3:00 PM", note: "Sold out", disabled: true, selected: false },
    ],
    session: null,
    requestedDatetime: "a",
    selectedDate: new Date(2030, 5, 1),
    dateLabel: "June 1",
    minDate: new Date(2030, 0, 1),
    isDateSelectable: () => true,
    onSelectDate: vi.fn(),
    onPickSession: vi.fn(),
    ...overrides,
  };
}

function panelViewModel(overrides: Partial<BookingPanelViewModel> = {}): BookingPanelViewModel {
  return {
    durationLabel: "3 hours",
    priceFrom: { amount: "₦5,000.00", unit: "/ person", showFrom: true },
    ruleNotes: ["10% off for 4+ guests"],
    sessions: sessionChoice(),
    tickets: [
      { id: "adult", label: "Adult", priceLabel: "₦5,000.00 / person", quantity: 2, max: 6, onChange: vi.fn() },
      { id: "child", label: "Child", priceLabel: "₦2,000.00 / person", quantity: 0, max: 4, onChange: vi.fn() },
    ],
    minGuestsWarning: null,
    days: { show: false, value: 1, onChange: vi.fn() },
    addons: [{ id: "lunch", label: "Lunch", priceLabel: "₦1,500.00", checked: false, onToggle: vi.fn() }],
    promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: null },
    quote: {
      updating: false,
      lines: [
        { key: "t", label: "Adult × 2", amount: "₦10,000.00", isDiscount: false },
        { key: "d", label: "SAVE10", amount: "-₦1,000.00", isDiscount: true },
      ],
    },
    quoteError: null,
    seatsWarning: null,
    total: "₦9,000.00",
    booking: { available: true, disabled: false, pending: false, label: "Book now - ₦9,000.00", onBook: vi.fn() },
    ...overrides,
  };
}

describe("BookingPanelView", () => {
  it("shows prices, rules, tickets, add-ons and the quote", () => {
    renderWithProviders(<BookingPanelView {...panelViewModel()} />);

    expect(screen.getByText("from")).toBeInTheDocument();
    expect(screen.getByText("₦5,000.00")).toBeInTheDocument();
    expect(screen.getByText("10% off for 4+ guests")).toBeInTheDocument();
    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.getByText("₦2,000.00 / person")).toBeInTheDocument();
    expect(screen.getByText("Adult × 2")).toBeInTheDocument();
    expect(screen.getByText("-₦1,000.00")).toHaveClass("text-green-700");
    expect(screen.getAllByText("₦9,000.00").length).toBeGreaterThan(0);
    expect(screen.getByText("Duration - 3 hours")).toBeInTheDocument();
    // The checkout preview was a design mock-up, not a real step.
    expect(screen.queryByRole("link", { name: /Preview/ })).not.toBeInTheDocument();
  });

  it("passes changes and the booking click to the view-model", async () => {
    const vm = panelViewModel({ days: { show: true, value: 2, onChange: vi.fn() } });
    const { user } = renderWithProviders(<BookingPanelView {...vm} />);

    await user.click(screen.getByRole("button", { name: "Increase Child" }));
    await user.click(screen.getByRole("button", { name: "Increase days" }));
    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "S");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("button", { name: "Book now - ₦9,000.00" }));

    expect(vm.tickets[1].onChange).toHaveBeenCalledWith(1);
    expect(vm.days.onChange).toHaveBeenCalledWith(3);
    expect(vm.addons[0].onToggle).toHaveBeenCalledWith(true);
    expect(vm.promo.onInputChange).toHaveBeenCalledWith("S");
    expect(vm.promo.onApply).toHaveBeenCalled();
    expect(vm.booking.onBook).toHaveBeenCalled();
  });

  it("shows warnings, promo results and quote errors", () => {
    renderWithProviders(
      <BookingPanelView
        {...panelViewModel({
          minGuestsWarning: "This experience needs at least 2 guests.",
          seatsWarning: "Only 1 spot left for this session.",
          promo: { input: "OLD", onInputChange: vi.fn(), onApply: vi.fn(), message: { text: "OLD has expired", ok: false } },
          quoteError: "We couldn't price this selection.",
          booking: { available: true, disabled: true, pending: true, label: "Starting checkout…", onBook: vi.fn() },
        })}
      />,
    );

    expect(screen.getByText("This experience needs at least 2 guests.")).toBeInTheDocument();
    expect(screen.getByText("Only 1 spot left for this session.")).toBeInTheDocument();
    expect(screen.getByText("OLD has expired")).toHaveClass("text-[#F5032D]");
    expect(screen.getByText("We couldn't price this selection.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Starting checkout…" })).toBeDisabled();
  });

  it("says when the experience can't be booked, and closes as a sheet", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <BookingPanelView
        {...panelViewModel({
          booking: { available: false, disabled: true, pending: false, label: "", onBook: vi.fn() },
          quote: null,
          promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: { text: "SAVE applied", ok: true } },
        })}
        onClose={onClose}
      />,
    );

    expect(screen.getByText(/isn.t available for booking yet/)).toBeInTheDocument();
    expect(screen.getByText("SAVE applied")).toHaveClass("text-green-700");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
