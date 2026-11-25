import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReceiptContent } from "./content";

vi.mock("@/components/home/home-nav", () => ({
  HomeNav: () => <nav data-testid="mock-home-nav">HomeNav</nav>,
}));

vi.mock("@/features/footer", () => ({
  Footer: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock("@/features/receipt", () => ({
  useReceiptViewModel: () => ({
    receipt: { orderNumber: "MJ-EV-48213" },
    isLoading: false,
    isError: false,
    errorStatus: null,
    isDownloading: false,
    refetch: vi.fn(),
    onDownloadPdf: vi.fn(),
  }),
  ReceiptView: ({ receipt }: { receipt: { orderNumber: string } | null }) => (
    <div data-testid="mock-receipt-view">{receipt?.orderNumber}</div>
  ),
}));

describe("ReceiptContent", () => {
  it("renders HomeNav, ReceiptView, and Footer", () => {
    render(<ReceiptContent bookingId="MJ-EV-48213" />);

    expect(screen.getByTestId("mock-home-nav")).toBeInTheDocument();
    expect(screen.getByTestId("mock-receipt-view")).toBeInTheDocument();
    expect(screen.getByTestId("mock-receipt-view")).toHaveTextContent("MJ-EV-48213");
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });
});
