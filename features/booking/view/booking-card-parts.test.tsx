import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import {
  BookingCardActionView,
  BookingCardInfoRows,
  BookingCardPriceView,
  BookingCardShell,
  BookingCardStepperButton,
  BookingCardTotalView,
} from "./booking-card-parts";

describe("booking card parts", () => {
  it("shows the price with its prefix and unit", () => {
    renderWithProviders(<BookingCardPriceView price={{ prefix: "From", amount: "₦7,500", unit: "per ticket" }} />);
    expect(screen.getByText("From ₦7,500")).toBeInTheDocument();
    expect(screen.getByText("per ticket")).toBeInTheDocument();
  });

  it("shows the live total with its note, or the hint when nothing is priced", () => {
    const { rerender } = renderWithProviders(
      <BookingCardTotalView total={{ amount: "₦32,000", hint: null, note: "Fees and taxes included" }} />,
    );
    expect(screen.getByText("₦32,000")).toBeInTheDocument();
    expect(screen.getByText("Fees and taxes included")).toBeInTheDocument();
    rerender(<BookingCardTotalView total={{ amount: null, hint: "Select a time", note: null }} />);
    expect(screen.getByText("Select a time")).toBeInTheDocument();
  });

  it("runs the action unless it is disabled", async () => {
    const onClick = vi.fn();
    const { user, rerender } = renderWithProviders(
      <BookingCardActionView action={{ label: "Book now", disabled: false, pending: false, onClick }}/>,
    );
    await user.click(screen.getByRole("button", { name: "Book now" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<BookingCardActionView action={{ label: "Book now", disabled: true, pending: false, onClick }} />);
    expect(screen.getByRole("button", { name: "Book now" })).toBeDisabled();
  });

  it("lists the policy rows, and renders nothing without any", () => {
    const { container, rerender } = renderWithProviders(
      <BookingCardInfoRows rows={[{ id: "r", icon: "refund", title: "Refund policy", body: "Up to 7 days before." }]} />,
    );
    expect(screen.getByText("Refund policy")).toBeInTheDocument();
    rerender(<BookingCardInfoRows rows={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("disables a stepper button at its limit", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <BookingCardStepperButton action="minus" size="sm" label="Decrease" disabled onClick={onClick} />,
    );
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("closes the sheet from the shell's close button", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <BookingCardShell onClose={onClose}>
        <p>Body</p>
      </BookingCardShell>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
