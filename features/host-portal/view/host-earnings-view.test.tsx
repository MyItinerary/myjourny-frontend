import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostEarningsViewModel } from "../view-model/use-host-earnings-view-model";
import { HostEarningsView } from "./host-earnings-view";

const vm = (over: Partial<HostEarningsViewModel> = {}): HostEarningsViewModel => ({
  ready: true,
  header: { title: "Earnings", subtitle: "", actions: [] },
  rangeLabel: "1 to 30 September 2026",
  range: "This month",
  ranges: ["This month", "Last month", "Last 3 months", "This year", "Everything"].map((value) => ({
    value: value as HostEarningsViewModel["ranges"][number]["value"],
    selected: value === "This month",
  })),
  onRange: vi.fn(),
  stats: [
    { label: "Earned all time", value: "₦1,046,000", note: "since March 2026" },
    { label: "Clearing now", value: "₦68,000", note: "in your bank Tue 22 Sept" },
  ],
  commissionHeading: "Our 15 percent",
  rows: [
    { ref: "MJ-4471", what: "Photowalk · Ifeoma Adeyemi, 4 places", date: "13 Sept", gross: "₦40,000", commission: "- ₦6,000", net: "₦34,000", status: "Cleared", plain: "₦40,000 booking, 15 percent commission ₦6,000, you receive ₦34,000." },
    { ref: "MJ-4502", what: "Photowalk · Amaka Eze, 2 places", date: "20 Sept", gross: "₦20,000", commission: "- ₦3,000", net: "₦17,000", status: "Clearing", plain: "₦20,000 booking, 15 percent commission ₦3,000, you receive ₦17,000." },
  ],
  none: false,
  noneMessage: "Nothing earned in this range.",
  onDownload: vi.fn(),
  ...over,
});

describe("HostEarningsView", () => {
  it("shows the range, the headline numbers and every booking", () => {
    renderWithProviders(<HostEarningsView vm={vm()} />);

    expect(screen.getByText("1 to 30 September 2026")).toBeInTheDocument();
    expect(screen.getByText("₦1,046,000")).toBeInTheDocument();
    expect(screen.getByText("in your bank Tue 22 Sept")).toBeInTheDocument();
    expect(screen.getByText("Every booking, and what we took")).toBeInTheDocument();
    for (const heading of ["Reference", "Listing and guest", "Date", "Guests paid", "Our 15 percent", "You receive", "Status"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByText("- ₦6,000")).toHaveClass("text-[#6F6B72]");
    expect(screen.getByText("₦34,000")).toHaveClass("font-medium");
    expect(screen.getByText("₦40,000 booking, 15 percent commission ₦6,000, you receive ₦34,000.")).toBeInTheDocument();
  });

  it("colours Cleared green and Clearing amber", () => {
    renderWithProviders(<HostEarningsView vm={vm()} />);
    expect(screen.getByText("Cleared")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("Clearing")).toHaveClass("text-[#B4760A]");
  });

  it("picks another range from the menu", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostEarningsView vm={props} />);

    await user.click(screen.getByRole("button", { name: "Range: This month" }));
    await user.click(await screen.findByRole("button", { name: "Last 3 months" }));

    expect(props.onRange).toHaveBeenCalledWith("Last 3 months");
  });

  it("downloads a statement", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostEarningsView vm={props} />);
    await user.click(screen.getByRole("button", { name: "Download a statement" }));
    expect(props.onDownload).toHaveBeenCalled();
  });

  it("says when there's nothing to list", () => {
    renderWithProviders(<HostEarningsView vm={vm({ rows: [], none: true })} />);
    expect(screen.getByText("Nothing earned in this range.")).toBeInTheDocument();
    expect(screen.queryByText("MJ-4471")).not.toBeInTheDocument();
  });

  it("shows an empty frame until today is known", () => {
    renderWithProviders(<HostEarningsView vm={vm({ ready: false })} />);
    expect(screen.queryByText("Every booking, and what we took")).not.toBeInTheDocument();
  });
});
