import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ReceiptData } from "../model/receipt.types";
import { ReceiptView } from "./receipt-view";

const mockReceipt: ReceiptData = {
  orderNumber: "MJ-EV-48213",
  paymentReference: "MJPAY-7F3A91C2",
  billedTo: "Ireti George",
  paidAmount: 24000,
  currency: "NGN",
  paidAtFormatted: "Paid on Wednesday, 21 October 2026 at 2:32 PM",
  experienceTitle: "Sunrise Kayaking at Tarkwa Bay",
  experienceLocation: "Tarkwa Bay, Lagos",
  experienceImageUrl: null,
  sessionDateTimeFormatted: "Saturday, 14 November 2026. 9:00 AM to 5:00 PM",
  meetingLocation: "Tarkwa Bay, Lagos",
  totalPriceFormatted: "₦24,000",
  partySizeLabel: "1 guest",
  taxesAndFeesNote: "Taxes and fees included",
  status: "paid",
};

describe("ReceiptView", () => {
  const defaultProps = {
    receipt: mockReceipt,
    isLoading: false,
    isError: false,
    errorStatus: null,
    bookingId: "b-test",
    isDownloading: false,
    refetch: vi.fn(),
    onDownloadPdf: vi.fn(),
  };

  it("renders skeleton when isLoading is true", () => {
    const { container } = render(<ReceiptView {...defaultProps} receipt={null} isLoading={true} />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders sign in prompt on 401 unauthorized", () => {
    render(
      <ReceiptView
        {...defaultProps}
        receipt={null}
        isError={true}
        errorStatus={401}
        bookingId="b-auth"
      />
    );

    expect(screen.getByText("Sign in to view receipt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?next=%2Freceipts%2Fb-auth"
    );
  });

  it("renders not found state on 404", () => {
    render(<ReceiptView {...defaultProps} receipt={null} isError={true} errorStatus={404} />);

    expect(screen.getByText("Receipt not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  it("renders retry button on generic error", () => {
    render(<ReceiptView {...defaultProps} receipt={null} isError={true} errorStatus={500} />);

    expect(screen.getByText("Couldn't load receipt")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /Try again/i });
    fireEvent.click(retryBtn);
    expect(defaultProps.refetch).toHaveBeenCalled();
  });

  it("renders receipt details and handles download on success", () => {
    render(<ReceiptView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Receipt", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Sunrise Kayaking at Tarkwa Bay")).toBeInTheDocument();
    expect(screen.getByText("MJ-EV-48213")).toBeInTheDocument();
    expect(screen.getByText("MJPAY-7F3A91C2")).toBeInTheDocument();
    expect(screen.getByText("Ireti George")).toBeInTheDocument();

    const downloadBtn = screen.getByRole("button", { name: /Download PDF/i });
    fireEvent.click(downloadBtn);
    expect(defaultProps.onDownloadPdf).toHaveBeenCalledTimes(1);
  });

  it("renders non-paid status badges appropriately", () => {
    const { rerender } = render(
      <ReceiptView {...defaultProps} receipt={{ ...mockReceipt, status: "refunded", paidAtFormatted: null }} />
    );
    expect(screen.getByText("Refunded")).toBeInTheDocument();
    expect(screen.queryByText("Paid")).not.toBeInTheDocument();

    rerender(
      <ReceiptView {...defaultProps} receipt={{ ...mockReceipt, status: "pending", paidAtFormatted: null }} />
    );
    expect(screen.getByText("Payment pending")).toBeInTheDocument();

    rerender(
      <ReceiptView {...defaultProps} receipt={{ ...mockReceipt, status: "unpaid", paidAtFormatted: null }} />
    );
    expect(screen.getByText("Unpaid")).toBeInTheDocument();
  });

  it("omits order details rows cleanly when backend identifiers are absent", () => {
    render(
      <ReceiptView
        {...defaultProps}
        receipt={{
          ...mockReceipt,
          orderNumber: null,
          paymentReference: null,
          billedTo: null,
        }}
      />
    );

    expect(screen.queryByText("Order details")).not.toBeInTheDocument();
  });
});
