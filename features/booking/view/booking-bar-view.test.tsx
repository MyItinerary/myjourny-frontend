import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingBarView } from "./booking-bar-view";

describe("BookingBarView", () => {
  it("shows the from price and opens the booking sheet", async () => {
    const onBookNow = vi.fn();
    const { user } = renderWithProviders(<BookingBarView priceFrom="₦5,000.00" onBookNow={onBookNow} />);

    expect(screen.getByText("from ₦5,000.00")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book now" }));

    expect(onBookNow).toHaveBeenCalled();
  });

  it("can carry its own note and button label", () => {
    renderWithProviders(
      <BookingBarView priceFrom="₦7,500" onBookNow={vi.fn()} note="Sat, 14 Nov 2026" actionLabel="Get tickets" />,
    );
    expect(screen.getByText("Sat, 14 Nov 2026")).toBeInTheDocument();
    expect(screen.queryByText(/Free cancellation/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get tickets" })).toBeInTheDocument();
  });
});
