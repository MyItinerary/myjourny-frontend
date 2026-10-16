import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { mockPaymentConfirmedEmail } from "./test-fixtures";
import { PaymentConfirmedEmailView } from "./payment-confirmed-email-view";

describe("PaymentConfirmedEmailView", () => {
  it("renders total charged, receipt breakdown, and download receipt CTA", () => {
    renderWithProviders(<PaymentConfirmedEmailView data={mockPaymentConfirmedEmail} />);

    expect(screen.getByText("PAYMENT CONFIRMED")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "You're all set for Tarkwa Bay" }),
    ).toBeInTheDocument();
    expect(screen.getByText("TOTAL CHARGED")).toBeInTheDocument();
    expect(screen.getAllByText(mockPaymentConfirmedEmail.totalChargedFormatted).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Download receipt" }),
    ).toHaveAttribute("href", mockPaymentConfirmedEmail.downloadReceiptUrl);
  });

  it("renders payment metadata and billing email link", () => {
    renderWithProviders(<PaymentConfirmedEmailView data={mockPaymentConfirmedEmail} />);

    expect(screen.getByText(mockPaymentConfirmedEmail.paymentMethod)).toBeInTheDocument();
    expect(screen.getByText(mockPaymentConfirmedEmail.receiptNumber)).toBeInTheDocument();
    expect(screen.getByText(mockPaymentConfirmedEmail.billingEmail)).toBeInTheDocument();
  });
});
