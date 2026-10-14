import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookingCancelledEmailView } from "./booking-cancelled-email-view";
import { mockBookingCancelledEmail } from "./test-fixtures";

describe("BookingCancelledEmailView", () => {
  it("renders cancellation title, refund amount and browse CTA", () => {
    renderWithProviders(<BookingCancelledEmailView data={mockBookingCancelledEmail} />);

    expect(screen.getByText("BOOKING CANCELLED")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "This booking's been cancelled" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(mockBookingCancelledEmail.refundAmountFormatted),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse experiences" }),
    ).toHaveAttribute("href", mockBookingCancelledEmail.browseUrl);
  });

  it("renders cancellation policy note and billing email link", () => {
    renderWithProviders(<BookingCancelledEmailView data={mockBookingCancelledEmail} />);

    expect(screen.getByText(mockBookingCancelledEmail.policyNote)).toBeInTheDocument();
    expect(screen.getByText(mockBookingCancelledEmail.billingEmail)).toBeInTheDocument();
  });
});
