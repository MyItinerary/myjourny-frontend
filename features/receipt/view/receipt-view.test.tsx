import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SAMPLE_RECEIPT } from "../model/receipt.types";
import { ReceiptView } from "./receipt-view";

describe("ReceiptView", () => {
  const defaultProps = {
    receipt: SAMPLE_RECEIPT,
    isLoading: false,
    isDownloading: false,
    isEmailing: false,
    onDownloadPdf: vi.fn(),
    onEmailCopy: vi.fn(),
  };

  it("renders page title and paid badge", () => {
    render(<ReceiptView {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Receipt", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Sunrise Kayaking at Tarkwa Bay")).toBeInTheDocument();
  });

  it("renders order details correctly", () => {
    render(<ReceiptView {...defaultProps} />);

    expect(screen.getByText("Order details")).toBeInTheDocument();
    expect(screen.getByText("MJ-EV-48213")).toBeInTheDocument();
    expect(screen.getByText("MJPAY-7F3A91C2")).toBeInTheDocument();
    expect(screen.getByText("Ireti George")).toBeInTheDocument();
  });

  it("triggers onDownloadPdf when Download PDF button is clicked", () => {
    render(<ReceiptView {...defaultProps} />);

    const downloadBtn = screen.getByRole("button", { name: /Download PDF/i });
    fireEvent.click(downloadBtn);
    expect(defaultProps.onDownloadPdf).toHaveBeenCalledTimes(1);
  });

  it("triggers onEmailCopy when Email me a copy button is clicked", () => {
    render(<ReceiptView {...defaultProps} />);

    const emailBtn = screen.getByRole("button", { name: /Email me a copy/i });
    fireEvent.click(emailBtn);
    expect(defaultProps.onEmailCopy).toHaveBeenCalledTimes(1);
  });
});
