import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingPanelViewModel } from "../view-model/use-booking-panel-view-model";
import type { SessionChoice } from "../view-model/use-session-choice";
import { BookingPanelView } from "./booking-panel-view";

function sessionChoice(overrides: Partial<SessionChoice> = {}): SessionChoice {
  return {
    loading: false,
    scheduled: true,
    noSessions: false,
    allSoldOut: false,
    options: [
      { startsAt: "a", label: "9:00 AM", note: null, disabled: false, selected: true },
      { startsAt: "b", label: "3:00 PM", note: "Sold out", disabled: true, selected: false },
    ],
    session: null,
    request: { requested_datetime: "a" },
    lengthDays: 1,
    selectedDate: new Date(2030, 5, 1),
    dateLabel: "June 1",
    minDate: new Date(2030, 0, 1),
    isDateSelectable: () => true,
    onSelectDate: vi.fn(),
    onPickSession: vi.fn(),
    fieldLabel: "Sat 1 June",
    endDate: null,
    dayState: () => "open",
    dayStatus: "ok",
    nextOpen: { label: "Sat 8 June", shortLabel: "8 June" },
    onJumpToNext: vi.fn(),
    urgency: null,
    ...overrides,
  };
}

function panelViewModel(overrides: Partial<BookingPanelViewModel> = {}): BookingPanelViewModel {
  return {
    durationLabel: "3 hours",
    cancellationPolicy: null,
    scheduleLabel: "Every Saturday · 3 days",
    lengthNote: null,
    priceFrom: { amount: "₦5,000", unit: "/ person", unitWords: "per person", showFrom: true },
    ruleNotes: [],
    sessions: sessionChoice(),
    tickets: [
      { id: "adult", label: "Adult", priceLabel: "₦5,000 / person", quantity: 2, max: 6, onChange: vi.fn() },
      { id: "child", label: "Child", priceLabel: "₦2,000 / person", quantity: 0, max: 4, onChange: vi.fn() },
    ],
    minGuestsWarning: null,
    days: { show: false, value: 1, onChange: vi.fn() },
    addons: [{ id: "lunch", label: "Lunch", priceLabel: "₦1,500", checked: false, onToggle: vi.fn() }],
    promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: null },
    quote: {
      updating: false,
      when: "Saturday, June 1, 9:00 AM",
      lines: [
        { key: "t", label: "Adult × 2", amount: "₦10,000", kind: "item" },
        { key: "s", label: "Subtotal", amount: "₦10,000", kind: "subtotal" },
        { key: "d", label: "Promo code SAVE10", amount: "−₦1,000", kind: "discount" },
      ],
      savings: "You save ₦1,000",
    },
    quoteError: null,
    seatsWarning: null,
    total: "₦9,000",
    booking: { available: true, disabled: false, pending: false, label: "Book now - ₦9,000", onBook: vi.fn() },
    card: {
      headline: { showFrom: true, amount: "₦5,000", unit: "per person", was: null, pill: null },
      notes: ["Every Saturday · 3 days", "10% off for 4+ guests"],
      dateField: "Sat 1 June · 3 hours",
      locked: false,
      notice: null,
      onRetry: vi.fn(),
      total: { amount: "₦9,000", muted: null, fees: "Fees and taxes included" },
      button: { label: "Book now", loading: false, disabled: false, onClick: vi.fn() },
      cancellation: { title: "Cancellation policy", body: "Full refund up to 24 hours before." },
    },
    ...overrides,
  };
}

const withCard = (card: Partial<BookingPanelViewModel["card"]>, rest: Partial<BookingPanelViewModel> = {}) => {
  const base = panelViewModel();
  return panelViewModel({ card: { ...base.card, ...card }, ...rest });
};

describe("BookingPanelView", () => {
  it("shows the price, the date and times, guests, the total, the button and the cancellation terms", () => {
    renderWithProviders(<BookingPanelView {...panelViewModel()} />);

    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getAllByText("₦5,000").length).toBeGreaterThan(0);
    expect(screen.getByText("per person")).toBeInTheDocument();
    expect(screen.getByText("Every Saturday · 3 days")).toBeInTheDocument();
    expect(screen.getByText("10% off for 4+ guests")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Date: Sat 1 June · 3 hours" })).toBeInTheDocument();
    expect(screen.getByText("Choose a time")).toBeInTheDocument();
    expect(screen.getByText("Adult")).toBeInTheDocument();
    expect(screen.getByText("₦2,000 / person")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("₦9,000")).toBeInTheDocument();
    expect(screen.getByText("Fees and taxes included")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book now" })).toBeEnabled();
    // No hint under the button: that the fee comes at checkout is expected.
    expect(screen.queryByText(/won.t be charged yet/)).not.toBeInTheDocument();
    expect(screen.queryByText(/processing fee/i)).not.toBeInTheDocument();
    expect(screen.getByText("Cancellation policy")).toBeInTheDocument();
    expect(screen.getByText("Full refund up to 24 hours before.")).toBeInTheDocument();
    // Not a sheet: no handle, no close button.
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("says Guests for a single ticket and shows each type when there are several", () => {
    const one = panelViewModel({ tickets: [{ id: "a", label: "Participants", priceLabel: null, quantity: 1, max: 4, onChange: vi.fn() }] });
    const { unmount } = renderWithProviders(<BookingPanelView {...one} />);
    expect(screen.getByText("Guests")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase guests" })).toBeInTheDocument();
    unmount();
    renderWithProviders(<BookingPanelView {...panelViewModel()} />);
    expect(screen.getByRole("button", { name: "Increase Child" })).toBeInTheDocument();
  });

  it("passes changes and the booking click to the view-model", async () => {
    const vm = panelViewModel({ days: { show: true, value: 2, onChange: vi.fn() } });
    const { user } = renderWithProviders(<BookingPanelView {...vm} />);

    await user.click(screen.getByRole("button", { name: "Increase Child" }));
    await user.click(screen.getByRole("button", { name: "Increase days" }));
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "9:00 AM" }));
    await user.click(screen.getByRole("button", { name: "Have a promo code?" }));
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "S");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("button", { name: "Book now" }));

    expect(vm.tickets[1].onChange).toHaveBeenCalledWith(1);
    expect(vm.days.onChange).toHaveBeenCalledWith(3);
    expect(vm.addons[0].onToggle).toHaveBeenCalledWith(true);
    expect(vm.sessions.onPickSession).toHaveBeenCalledWith("a");
    expect(vm.promo.onInputChange).toHaveBeenCalledWith("S");
    expect(vm.promo.onApply).toHaveBeenCalled();
    expect(vm.card.button.onClick).toHaveBeenCalled();
  });

  it("opens the calendar from the date field and hides the times behind it", async () => {
    const { user } = renderWithProviders(<BookingPanelView {...panelViewModel()} />);
    await user.click(screen.getByRole("button", { name: /^Date:/ }));

    expect(screen.getByRole("group", { name: "Pick a date" })).toBeInTheDocument();
    expect(screen.queryByText("Choose a time")).not.toBeInTheDocument();
  });

  it("shows an urgency badge only when the view-model has one", () => {
    const { unmount } = renderWithProviders(<BookingPanelView {...panelViewModel()} />);
    expect(screen.queryByText(/spots left/)).not.toBeInTheDocument();
    unmount();
    renderWithProviders(
      <BookingPanelView {...panelViewModel({ sessions: sessionChoice({ urgency: { level: "few", text: "3 spots left at 9:00 AM on Sat 1 June" } }) })} />,
    );
    expect(screen.getByText("3 spots left at 9:00 AM on Sat 1 June")).toBeInTheDocument();
  });

  it("names a sold-out day, says what is missing from the total, and jumps to the next date", async () => {
    const onClick = vi.fn();
    const vm = withCard({
      notice: { tone: "neutral", title: "Sold out on 1 June", body: "Next available: Sat 8 June.", action: { label: "See all dates", kind: "dates" } },
      total: { amount: null, muted: "Pick another date", fees: "Fees and taxes included" },
      button: { label: "Jump to 8 June", loading: false, disabled: false, onClick },
    });
    const { user } = renderWithProviders(<BookingPanelView {...vm} />);

    expect(screen.getByText("Sold out on 1 June")).toBeInTheDocument();
    expect(screen.getByText("Pick another date")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Jump to 8 June" }));
    expect(onClick).toHaveBeenCalled();

    // "See all dates" opens the calendar.
    await user.click(screen.getByRole("button", { name: "See all dates" }));
    expect(screen.getByRole("group", { name: "Pick a date" })).toBeInTheDocument();
  });

  it("offers a retry on an error and says nothing was charged", async () => {
    const onRetry = vi.fn();
    const vm = withCard({
      notice: { tone: "error", title: "We couldn't price this selection", body: "Pricing is down. Nothing has been booked or charged.", action: { label: "Try again", kind: "retry" } },
      onRetry,
    });
    const { user } = renderWithProviders(<BookingPanelView {...vm} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Nothing has been booked or charged.");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("freezes the inputs and shows dots on the button while a booking starts", () => {
    renderWithProviders(
      <BookingPanelView {...withCard({ locked: true, button: { label: null, loading: true, disabled: true, onClick: vi.fn() } })} />,
    );

    expect(screen.getByRole("button", { name: "Increase Child" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "9:00 AM" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Date:/ })).toBeDisabled();
    expect(screen.getByLabelText("Starting your booking")).toBeInTheDocument();
  });

  it("shows promo results, the quote lines, and strikes through the price before early-bird", () => {
    renderWithProviders(
      <BookingPanelView
        {...panelViewModel({
          promo: { input: "OLD", onInputChange: vi.fn(), onApply: vi.fn(), message: { text: "OLD has expired", ok: false } },
          quote: {
            updating: false,
            when: null,
            lines: [
              { key: "t", label: "Standard", amount: "₦9,900", listAmount: "₦10,000", kind: "item" },
              { key: "s", label: "Subtotal", amount: "₦10,000", kind: "subtotal" },
              { key: "e", label: "Early-bird discount (1% off)", amount: "−₦100", kind: "discount" },
            ],
            savings: "You save ₦100",
          },
        })}
      />,
    );

    expect(screen.getByText("OLD has expired")).toBeInTheDocument();
    expect(screen.getByLabelText("was ₦10,000").tagName).toBe("S");
    expect(screen.getByText("Early-bird discount (1% off)")).toBeInTheDocument();
    expect(screen.getByText("You save ₦100")).toBeInTheDocument();
  });

  it("shows the early-bird price with its list price struck through and a pill", () => {
    const vm = withCard({ headline: { showFrom: false, amount: "₦16,000", unit: "per person", was: "₦20,000", pill: "Early bird" } });
    renderWithProviders(<BookingPanelView {...vm} />);
    expect(screen.getByLabelText("was ₦20,000").tagName).toBe("S");
    expect(screen.getByText("Early bird")).toBeInTheDocument();
    expect(screen.queryByText("From")).not.toBeInTheDocument();
  });

  it("doesn't itemise a single ticket line, which just repeats the total", () => {
    renderWithProviders(
      <BookingPanelView
        {...panelViewModel({
          quote: { updating: false, when: null, lines: [{ key: "t", label: "Adult × 2", amount: "₦10,000", kind: "item" }], savings: null },
        })}
      />,
    );
    expect(screen.queryByText("Adult × 2")).not.toBeInTheDocument();
  });

  it("shows a green promo result", () => {
    renderWithProviders(
      <BookingPanelView {...panelViewModel({ promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: { text: "SAVE applied", ok: true } } })} />,
    );
    expect(screen.getByText("SAVE applied")).toHaveClass("text-[#0B7A47]");
  });

  it("says when the experience can't be booked yet, and is a sheet with a title and close when given onClose", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <BookingPanelView
        {...panelViewModel({ booking: { available: false, disabled: true, pending: false, label: "", onBook: vi.fn() }, quote: null })}
        onClose={onClose}
        title="Kayaking in Victoria Island"
      />,
    );

    expect(screen.getByText(/isn.t available for booking yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Book now" })).not.toBeInTheDocument();
    expect(screen.getByText("Kayaking in Victoria Island")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the total muted and the button greyed until something real is picked", () => {
    renderWithProviders(
      <BookingPanelView
        {...withCard({
          total: { amount: null, muted: "Select a time", fees: "Fees and taxes included" },
          button: { label: "Book now", loading: false, disabled: true, onClick: vi.fn() },
        })}
      />,
    );
    const total = screen.getByText("Total").parentElement!;
    expect(within(total).getByText("Select a time")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Book now" })).toBeDisabled();
  });
});
