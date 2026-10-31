import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import type { EventBookingData } from "../model/booking-card.types";
import { useEventBookingCardViewModel } from "./use-event-booking-card-view-model";

const data: EventBookingData = {
  currency: "NGN",
  date: { title: "Saturday 12 September 2026", subtitle: "Doors 6:00pm" },
  tiers: [
    { id: "regular", name: "Regular", amount: 10000, status: "available", maxQuantity: 3 },
    { id: "table", name: "Table for 4", amount: 80000, perPersonAmount: 20000, status: "available", maxQuantity: 1 },
    { id: "vip", name: "VIP", amount: 25000, status: "sold_out", maxQuantity: 2 },
  ],
};

const render = (onBook = vi.fn(), pending = false) =>
  renderHookWithProviders(() => useEventBookingCardViewModel({ data, onBook, pending }));

describe("useEventBookingCardViewModel", () => {
  it("asks for tickets before pricing", () => {
    const { result } = render();
    expect(result.current.total).toEqual({ amount: null, hint: "Select tickets", note: null });
    expect(result.current.action.disabled).toBe(true);
    expect(result.current.tiers[1].perPersonLabel).toBe("₦20,000 per person");
  });

  it("totals the tickets picked and outlines the tiers that have some", () => {
    const { result } = render();
    act(() => result.current.tiers[0].onIncrease());
    act(() => result.current.tiers[0].onIncrease());
    expect(result.current.tiers[0]).toMatchObject({ quantity: 2, selected: true, canDecrease: true });
    expect(result.current.tiers[1].selected).toBe(false);
    expect(result.current.total).toEqual({ amount: "₦20,000", hint: null, note: "Fees and taxes included" });
    expect(result.current.action.disabled).toBe(false);
  });

  it("stops at a tier's maximum and at zero", () => {
    const { result } = render();
    expect(result.current.tiers[1].canDecrease).toBe(false);
    act(() => result.current.tiers[1].onIncrease());
    expect(result.current.tiers[1].canIncrease).toBe(false);
    act(() => result.current.tiers[1].onDecrease());
    expect(result.current.tiers[1].quantity).toBe(0);
  });

  it("cannot pick a sold-out tier, and labels it", () => {
    const { result } = render();
    expect(result.current.tiers[2]).toMatchObject({
      canIncrease: false,
      canDecrease: false,
      marker: { tone: "strong", label: "Sold out" },
    });
  });

  it("hands the pick to the checkout", () => {
    const onBook = vi.fn();
    const { result } = render(onBook);
    act(() => result.current.tiers[0].onIncrease());
    act(() => result.current.tiers[1].onIncrease());
    act(() => result.current.action.onClick());
    expect(onBook).toHaveBeenCalledWith({
      items: [
        { tierId: "regular", quantity: 1 },
        { tierId: "table", quantity: 1 },
      ],
      total: 90000,
      currency: "NGN",
    });
  });

  it("disables the button while a booking is pending", () => {
    const { result } = render(vi.fn(), true);
    act(() => result.current.tiers[0].onIncrease());
    expect(result.current.action).toMatchObject({ disabled: true, pending: true });
  });
});
