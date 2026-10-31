import { describe, expect, it, vi } from "vitest";

import type { BookingPanelViewModel } from "./use-booking-panel-view-model";
import { shortDate, toExperienceBookingBar, toExperienceBookingCard } from "./use-experience-booking-card-view-model";

function panel(overrides: Partial<BookingPanelViewModel> = {}): BookingPanelViewModel {
  return {
    durationLabel: "2 hours",
    scheduleLabel: null,
    lengthNote: null,
    priceFrom: { amount: "₦16,000.00", unit: "/ person", showFrom: false },
    ruleNotes: [],
    tickets: [{ id: "t", label: "Participants", priceLabel: null, quantity: 2, max: 8, onChange: vi.fn() }],
    addons: [],
    days: { show: false, value: 1, onChange: vi.fn() },
    minGuestsWarning: null,
    sessions: { scheduled: true, session: { starts_at: "x" }, noSessions: false, allSoldOut: false, options: [] },
    promo: { input: "", onInputChange: vi.fn(), onApply: vi.fn(), message: null },
    quote: null,
    quoteError: null,
    seatsWarning: null,
    total: "₦32,000.00",
    totalEstimate: "₦32,000.00",
    totalUpdating: false,
    booking: { available: true, disabled: false, pending: false, label: "Book now - ₦32,000.00", onBook: vi.fn() },
    ...overrides,
  } as unknown as BookingPanelViewModel;
}

describe("toExperienceBookingCard", () => {
  it("shows whole-naira prices and a plain Book now label", () => {
    const card = toExperienceBookingCard(panel());
    expect(card.price).toEqual({ prefix: null, amount: "₦16,000", unit: "per person" });
    expect(card.total).toEqual({ amount: "₦32,000", hint: null, note: "Fees and taxes included", updating: false });
    expect(card.action?.label).toBe("Book now");
    expect(card.scheduleLabel).toBeNull();
    expect(card.guests[0]).toMatchObject({ label: "Guests", sublabel: null, quantity: 2 });
  });

  it("shows the list-price estimate at once, dimmed, while the server prices a change", () => {
    const card = toExperienceBookingCard(panel({ total: "₦16,000.00", totalEstimate: "₦48,000.00", totalUpdating: true }));
    expect(card.total).toEqual({ amount: "₦48,000", hint: null, note: "Fees and taxes included", updating: true });
    const settled = toExperienceBookingCard(panel({ total: "₦47,000.00", totalEstimate: "₦48,000.00", totalUpdating: false }));
    expect(settled.total).toMatchObject({ amount: "₦47,000", updating: false });
  });

  it("says what is missing while nothing can be priced", () => {
    const card = toExperienceBookingCard(
      panel({ total: null, sessions: { scheduled: true, session: null, options: [] } as never }),
    );
    expect(card.total).toEqual({ amount: null, hint: "Select a time", note: null, updating: false });
  });

  it("keeps the panel's own words when the selection can't be booked", () => {
    const card = toExperienceBookingCard(
      panel({
        total: null,
        minGuestsWarning: "This experience needs at least 3 guests.",
        booking: { available: true, disabled: true, pending: false, label: "Select at least 3 guests", onBook: vi.fn() },
      }),
    );
    expect(card.action).toMatchObject({ label: "Select at least 3 guests", disabled: true });
    expect(card.notices).toEqual(["This experience needs at least 3 guests."]);
    expect(card.total.hint).toBe("Add guests");
  });

  it("has no action when the experience can't be booked, and carries the policy rows", () => {
    const info = [{ id: "c", icon: "cancellation" as const, title: "Free cancellation", body: "Until Friday." }];
    const card = toExperienceBookingCard(
      panel({ booking: { available: false, disabled: true, pending: false, label: "Book now", onBook: vi.fn() } }),
      { info },
    );
    expect(card.action).toBeNull();
    expect(card.info).toEqual(info);
  });

  it("carries days, extras and promo, but not the pricing notes or the itemised quote", () => {
    const card = toExperienceBookingCard(
      panel({
        ruleNotes: ["10% off for 3+ guests"],
        lengthNote: "Each booking covers all 3 days.",
        quote: {
          lines: [{ key: "d", label: "SAVE10", amount: "−₦1,000.00", kind: "discount" }],
          savings: "You save ₦1,000.00",
          updating: false,
          when: null,
        },
      }),
    );
    expect(card.days.show).toBe(false);
    expect(card.promo).toBeDefined();
    expect(card).not.toHaveProperty("ruleNotes");
    expect(card).not.toHaveProperty("summary");
    expect(card.notices).toEqual([]);
  });
});

describe("shortDate", () => {
  it("writes a day as the mobile bar does", () => {
    expect(shortDate(new Date(2026, 8, 12))).toBe("Sat 12 Sept");
    expect(shortDate(new Date(2026, 10, 3))).toBe("Tue 3 Nov");
  });
});

describe("toExperienceBookingBar", () => {
  const card = (sessions: Record<string, unknown>) =>
    toExperienceBookingCard(
      panel({
        sessions: {
          scheduled: true,
          noSessions: false,
          allSoldOut: false,
          selectedDate: new Date(2026, 8, 12),
          options: [
            { startsAt: "a", label: "6:00 AM", note: null, disabled: false, selected: false },
            { startsAt: "b", label: "7:00 AM", note: "3 left", disabled: false, selected: true },
          ],
          ...sessions,
        } as never,
      }),
    );

  it("shows the price, the date and time picked, and the seats left when few", () => {
    expect(toExperienceBookingBar(card({}))).toEqual({
      summary: "₦16,000 per person",
      detail: "Sat 12 Sept · 7:00am",
      urgency: "3 spots left at 7:00am",
      actionLabel: "Book now",
    });
  });

  it("says one spot, and has no badge when plenty are left", () => {
    const one = card({ options: [{ startsAt: "b", label: "7:00 AM", note: "1 left", disabled: false, selected: true }] });
    expect(toExperienceBookingBar(one).urgency).toBe("1 spot left at 7:00am");
    const plenty = card({ options: [{ startsAt: "b", label: "7:00 AM", note: null, disabled: false, selected: true }] });
    expect(toExperienceBookingBar(plenty).urgency).toBeNull();
  });

  it("switches the button off when nothing can be booked", () => {
    expect(toExperienceBookingBar(card({ noSessions: true, options: [] }))).toMatchObject({
      summary: "No upcoming sessions",
      actionDisabled: true,
    });
    expect(toExperienceBookingBar(card({ allSoldOut: true, options: [] }))).toMatchObject({ summary: "Sold out" });
  });
});
