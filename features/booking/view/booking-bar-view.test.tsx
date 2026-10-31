import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingBarView } from "./booking-bar-view";

describe("BookingBarView", () => {
  it("shows the price and the date and time", () => {
    renderWithProviders(
      <BookingBarView summary="₦16,000 per person" detail="Sat 12 Sept · 9:00am" actionLabel="Book now" onAction={vi.fn()} onExpand={vi.fn()} />,
    );
    expect(screen.getByText("₦16,000 per person")).toBeInTheDocument();
    expect(screen.getByText("Sat 12 Sept · 9:00am")).toBeInTheDocument();
  });

  it("starts the booking from the button alone, without expanding the sheet", async () => {
    const onAction = vi.fn();
    const onExpand = vi.fn();
    const { user } = renderWithProviders(
      <BookingBarView summary="₦16,000 per person" actionLabel="Book now" onAction={onAction} onExpand={onExpand} />,
    );
    await user.click(screen.getByRole("button", { name: "Book now" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onExpand).not.toHaveBeenCalled();
  });

  it("expands the sheet from the handle and from anywhere on the bar but the button", async () => {
    const onAction = vi.fn();
    const onExpand = vi.fn();
    const { user } = renderWithProviders(
      <BookingBarView summary="₦16,000 per person" actionLabel="Book now" onAction={onAction} onExpand={onExpand} />,
    );
    await user.click(screen.getByRole("button", { name: "Open booking" }));
    expect(onExpand).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText("₦16,000 per person"));
    expect(onExpand).toHaveBeenCalledTimes(2);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("shows the urgency badge only when given one", () => {
    const { rerender } = renderWithProviders(
      <BookingBarView summary="₦16,000 per person" urgency="3 spots left at 7:00am" actionLabel="Book now" onAction={vi.fn()} onExpand={vi.fn()} />,
    );
    expect(screen.getByText("3 spots left at 7:00am")).toBeInTheDocument();
    rerender(<BookingBarView summary="₦16,000 per person" actionLabel="Book now" onAction={vi.fn()} onExpand={vi.fn()} />);
    expect(screen.queryByText(/spots left/)).not.toBeInTheDocument();
  });

  it("can have its button switched off, while the sheet still expands", () => {
    renderWithProviders(<BookingBarView summary="Sold out" actionLabel="Book now" actionDisabled onAction={vi.fn()} onExpand={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Book now" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Open booking" })).toBeEnabled();
  });
});
