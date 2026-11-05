import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SAMPLE_RECEIPT } from "@/features/receipt";
import { ReceiptGeneralContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/components/home/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/receipt", () => ({
  useReceiptViewModel: () => ({
    receipt: SAMPLE_RECEIPT,
    isLoading: false,
    isDownloading: false,
    isEmailing: false,
    onDownloadPdf: vi.fn(),
    onEmailCopy: vi.fn(),
  }),
  ReceiptView: ({ receipt }: { receipt: { orderNumber: string } }) => (
    <div data-testid="mock-receipt-view">{receipt.orderNumber}</div>
  ),
  SAMPLE_RECEIPT: {
    orderNumber: "MJ-EV-48213",
  },
}));

describe("ReceiptGeneralContent", () => {
  it("renders HomeNav, ReceiptView, and Footer", () => {
    render(<ReceiptGeneralContent />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-receipt-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-receipt-view")).toHaveTextContent("MJ-EV-48213");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
