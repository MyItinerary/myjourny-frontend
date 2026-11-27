import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostEarningsViewModel } from "../view-model/use-host-earnings-view-model";
import { HostEarningsView } from "./host-earnings-view";

const vm = (over: Partial<HostEarningsViewModel> = {}): HostEarningsViewModel => ({
  loading: false,
  error: null,
  header: { title: "Earnings", subtitle: "Ledger totals, shown separately by currency", actions: [] },
  stats: [
    { label: "NGN earned", value: "₦48,000", note: "All time" },
    { label: "NGN pending", value: "₦15,000", note: "Awaiting payout" },
  ],
  rows: [
    {
      id: "booking-1", booking: "booking-1", experience: "Lagos food walk", date: "29 Nov 2026", currency: "NGN",
      earned: "₦30,000", pending: "₦0", paidOut: "₦30,000", status: "paid", statusLabel: "Paid",
    },
    {
      id: "booking-2", booking: "booking-2", experience: "Lagos art tour", date: "3 Dec 2026", currency: "USD",
      earned: "$120", pending: "$120", paidOut: "$0", status: "partial", statusLabel: "Partial",
    },
  ],
  none: false,
  noneMessage: "Nothing earned in this range.",
  onDownload: vi.fn(),
  ...over,
});

describe("HostEarningsView", () => {
  it("shows currency totals and the ledger amounts for each booking", () => {
    renderWithProviders(<HostEarningsView vm={vm()} />);

    expect(screen.getByText("NGN earned")).toBeInTheDocument();
    expect(screen.getByText("$120")).toBeInTheDocument();
    expect(screen.getByText("Earnings by booking")).toBeInTheDocument();
    for (const heading of ["Booking", "Experience", "Session", "Currency", "Earned", "Pending", "Paid out", "Status"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("booking-1")).toBeInTheDocument();
    expect(screen.getByText("Lagos food walk")).toBeInTheDocument();
    expect(screen.getByText("Partial")).toHaveClass("text-[#B4760A]");
    expect(screen.getByText("Paid")).toHaveClass("text-[#0CBA65]");
  });

  it("downloads a statement", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostEarningsView vm={props} />);
    await user.click(screen.getByRole("button", { name: "Download a statement" }));
    expect(props.onDownload).toHaveBeenCalled();
  });

  it("shows empty, loading and error states", () => {
    const { rerender } = renderWithProviders(<HostEarningsView vm={vm({ rows: [], none: true })} />);
    expect(screen.getByText("Nothing earned in this range.")).toBeInTheDocument();

    rerender(<HostEarningsView vm={vm({ loading: true })} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading earnings");

    rerender(<HostEarningsView vm={vm({ error: "Couldn't load your earnings." })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load your earnings.");
  });
});
