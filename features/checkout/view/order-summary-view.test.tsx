import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { OrderSummary } from "../view-model/use-checkout-view-model";
import { OrderSummaryView } from "./order-summary-view";

const summary: OrderSummary = {
  title: "Lagos Food Walk",
  imageUrl: "/kayak.jpg",
  rating: 4,
  when: "Tuesday, September 12 at 7:30 AM",
  guests: "1 guest",
  durationLabel: "2.5 hours",
  total: "₦16,000.00",
  quantity: "x 1 Adult",
  changeHref: "/experiences/exp-1",
};

describe("OrderSummaryView", () => {
  it("lists the booking, the policies and the total", () => {
    renderWithProviders(<OrderSummaryView summary={summary} />);

    expect(screen.getAllByText("Lagos Food Walk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1 guest").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/₦16,000\.00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("x 1 Adult").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Free cancellation").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Make changes to this booking")[0].closest("a")).toHaveAttribute("href", "/experiences/exp-1");
  });

  it("opens the bottom bar to show the details on a phone", async () => {
    const { user } = renderWithProviders(<OrderSummaryView summary={{ ...summary, rating: null, imageUrl: null }} />);
    const before = screen.getAllByText("Lagos Food Walk").length;

    await user.click(screen.getByRole("button", { name: "Show order details" }));

    expect(screen.getAllByText("Lagos Food Walk").length).toBeGreaterThan(before);
    await user.click(screen.getByRole("button", { name: "Hide order details" }));
    expect(screen.getAllByText("Lagos Food Walk").length).toBe(before);
  });
});
