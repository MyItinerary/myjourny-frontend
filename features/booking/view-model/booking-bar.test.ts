import { describe, expect, it } from "vitest";

import { shortDate, toExperienceBookingBar } from "./booking-bar";
import type { BookingPanelViewModel } from "./use-booking-panel-view-model";

type Input = Pick<BookingPanelViewModel, "card" | "sessions">;

const input = (sessions: Record<string, unknown> = {}, headline: Record<string, unknown> = {}): Input =>
  ({
    card: {
      headline: { showFrom: false, amount: "₦16,000", unit: "per person", was: null, pill: null, ...headline },
      button: { label: "Book now", loading: false, disabled: false, onClick: () => {} },
    },
    sessions: {
      noSessions: false,
      allSoldOut: false,
      selectedDate: new Date(2026, 8, 12),
      options: [
        { startsAt: "a", label: "6:00 AM", note: null, disabled: false, selected: false },
        { startsAt: "b", label: "7:00 AM", note: "3 left", disabled: false, selected: true },
      ],
      ...sessions,
    },
  }) as unknown as Input;

describe("shortDate", () => {
  it("writes a day as the mobile bar does", () => {
    expect(shortDate(new Date(2026, 8, 12))).toBe("Sat 12 Sept");
    expect(shortDate(new Date(2026, 10, 3))).toBe("Tue 3 Nov");
  });
});

describe("toExperienceBookingBar", () => {
  it("shows the price, the date and time picked, and the seats left when few", () => {
    expect(toExperienceBookingBar(input())).toEqual({
      summary: "₦16,000 per person",
      detail: "Sat 12 Sept · 7:00am",
      urgency: "3 spots left at 7:00am",
      actionLabel: "Book now",
    });
  });

  it("says From when the ticket types differ", () => {
    expect(toExperienceBookingBar(input({}, { showFrom: true })).summary).toBe("From ₦16,000 per person");
  });

  it("says one spot, and has no badge when plenty are left", () => {
    const one = input({ options: [{ startsAt: "b", label: "7:00 AM", note: "1 left", disabled: false, selected: true }] });
    expect(toExperienceBookingBar(one).urgency).toBe("1 spot left at 7:00am");
    const plenty = input({ options: [{ startsAt: "b", label: "7:00 AM", note: null, disabled: false, selected: true }] });
    expect(toExperienceBookingBar(plenty).urgency).toBeNull();
  });

  it("switches the button off when nothing can be booked", () => {
    expect(toExperienceBookingBar(input({ noSessions: true, options: [] }))).toMatchObject({
      summary: "No upcoming sessions",
      actionDisabled: true,
    });
    expect(toExperienceBookingBar(input({ allSoldOut: true, options: [] }))).toMatchObject({ summary: "Sold out" });
  });
});
