import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { EventBookingCardProps, EventTierRow } from "../view-model/use-event-booking-card-view-model";
import { EventBookingCardView } from "./event-booking-card-view";

const tier = (overrides: Partial<EventTierRow> = {}): EventTierRow => ({
  id: "regular",
  name: "Regular",
  description: "General entry",
  priceLabel: "₦10,000",
  perPersonLabel: null,
  status: "available",
  marker: null,
  quantity: 0,
  selected: false,
  canDecrease: false,
  canIncrease: true,
  onDecrease: vi.fn(),
  onIncrease: vi.fn(),
  ...overrides,
});

function card(overrides: Partial<EventBookingCardProps> = {}): EventBookingCardProps {
  return {
    date: { title: "Saturday 12 September 2026", subtitle: "Doors 6:00pm · Music from 7:00pm" },
    tiers: [
      tier({ quantity: 2, selected: true, canDecrease: true, marker: { tone: "urgency", label: "4 left at ₦10,000" } }),
      tier({ id: "table", name: "Table for 4", priceLabel: "₦80,000", perPersonLabel: "₦20,000 per person" }),
      tier({ id: "vip", name: "VIP", status: "sold_out", marker: { tone: "strong", label: "Sold out" } }),
    ],
    total: { amount: "₦20,000", hint: null, note: "Fees and taxes included" },
    action: { label: "Get tickets", disabled: false, pending: false, onClick: vi.fn() },
    ...overrides,
  };
}

describe("EventBookingCardView", () => {
  it("shows the date (with no headline price), each tier with its marker, the total, and no policy rows", () => {
    renderWithProviders(<EventBookingCardView {...card()} />);
    expect(screen.queryByText(/per ticket/)).not.toBeInTheDocument();
    expect(screen.getByText("Saturday 12 September 2026")).toBeInTheDocument();
    expect(screen.getByText("Doors 6:00pm · Music from 7:00pm")).toBeInTheDocument();
    expect(screen.getByText("4 left at ₦10,000")).toBeInTheDocument();
    expect(screen.getByText("₦20,000 per person")).toBeInTheDocument();
    expect(screen.getByText("Sold out")).toBeInTheDocument();
    expect(screen.getByText("₦20,000")).toBeInTheDocument();
    expect(screen.queryByText(/cancellation|refund/i)).not.toBeInTheDocument();
  });

  it("steps a tier up and down", async () => {
    const view = card();
    const { user } = renderWithProviders(<EventBookingCardView {...view} />);
    await user.click(screen.getByRole("button", { name: "Increase Regular" }));
    expect(view.tiers[0].onIncrease).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Decrease Regular" }));
    expect(view.tiers[0].onDecrease).toHaveBeenCalled();
  });

  it("has no stepper on a sold-out tier", () => {
    renderWithProviders(<EventBookingCardView {...card()} />);
    expect(screen.queryByRole("button", { name: "Increase VIP" })).not.toBeInTheDocument();
  });

  it("disables the minus button at zero tickets", () => {
    renderWithProviders(<EventBookingCardView {...card()} />);
    expect(screen.getByRole("button", { name: "Decrease Table for 4" })).toBeDisabled();
  });

  it("gets tickets through the button, and asks for tickets first when none are picked", async () => {
    const view = card();
    const { user, rerender } = renderWithProviders(<EventBookingCardView {...view} />);
    await user.click(screen.getByRole("button", { name: "Get tickets" }));
    expect(view.action.onClick).toHaveBeenCalled();
    rerender(
      <EventBookingCardView
        {...card({
          total: { amount: null, hint: "Select tickets", note: null },
          action: { label: "Get tickets", disabled: true, pending: false, onClick: vi.fn() },
        })}
      />,
    );
    expect(screen.getByText("Select tickets")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get tickets" })).toBeDisabled();
  });
});
