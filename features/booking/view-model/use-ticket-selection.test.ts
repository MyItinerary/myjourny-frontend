import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import type { ExperiencePricing } from "../model/booking.types";
import { useTicketSelection } from "./use-ticket-selection";

const pricing: ExperiencePricing = {
  currency: "NGN",
  prices: [
    { id: "adult", label: "Adult", amount: "5000.00", pricing_unit: "per_person" },
    { id: "pass", label: "Day pass", amount: "3000.00", pricing_unit: "per_day" },
  ],
  addons: [{ id: "lunch", label: "Lunch", amount: "1500.00", pricing_unit: "per_person" }],
  rules: [{ id: "r", kind: "group", min_guests: 4, percent_off: 10 }],
};

const render = (options: Partial<Parameters<typeof useTicketSelection>[0]> = {}) =>
  renderHookWithProviders(() =>
    useTicketSelection({ pricing, fallbackPrices: [], currency: "NGN", minGuests: 2, maxGuests: 6, ...options }),
  );

describe("useTicketSelection", () => {
  it("starts the cheapest ticket at the minimum group size", () => {
    const { result } = render();
    expect(result.current.priceFrom).toEqual({ amount: "₦3,000.00", unit: "/ person / day", showFrom: true });
    expect(result.current.tickets.map((t) => [t.label, t.quantity, t.max])).toEqual([
      ["Adult", 0, 4],
      ["Day pass", 2, 6],
    ]);
    expect(result.current.tickets[0].priceLabel).toBe("₦5,000.00 / person");
    expect(result.current.ruleNotes).toEqual(["10% off for 4+ guests"]);
    // A per-day ticket is picked, so days are asked for.
    expect(result.current.days.show).toBe(true);
    expect(result.current.picked).toEqual({
      items: [{ experience_price_id: "pass", quantity: 2 }],
      addons: [],
      days: 1,
    });
  });

  it("changes quantities, days and add-ons", () => {
    const { result } = render();
    act(() => result.current.tickets[0].onChange(1));
    act(() => result.current.days.onChange(3));
    act(() => result.current.addons[0].onToggle(true));

    expect(result.current.guests).toBe(3);
    expect(result.current.addons[0]).toMatchObject({ checked: true, priceLabel: "₦1,500.00 / person" });
    expect(result.current.picked).toEqual({
      items: [
        { experience_price_id: "adult", quantity: 1 },
        { experience_price_id: "pass", quantity: 2 },
      ],
      addons: [{ addon_id: "lunch", quantity: 1 }],
      days: 3,
    });
  });

  it("warns below the minimum group size", () => {
    const { result } = render();
    act(() => result.current.tickets[1].onChange(1));
    expect(result.current.minGuestsWarning).toBe("This experience needs at least 2 guests.");
  });

  it("uses the experience's prices until pricing loads", () => {
    const { result } = render({
      pricing: undefined,
      fallbackPrices: [{ id: "std", label: "Standard", amount: 4000 }],
      minGuests: 1,
    });
    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.tickets[0]).toMatchObject({ label: "Participants", priceLabel: null, quantity: 1 });
    expect(result.current.priceFrom.showFrom).toBe(false);
    expect(result.current.addons).toEqual([]);
  });
});
