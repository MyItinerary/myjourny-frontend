import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostBooking } from "../model/bookings.types";
import type { HostBookingsViewModel } from "../view-model/use-host-bookings-view-model";
import { HostBookingsView } from "./host-bookings-view";

const booking = (over: Partial<HostBooking> = {}): HostBooking => ({
  id: "b1",
  ref: "MJ-4502",
  tab: "Requests",
  when: "tomorrow",
  listing: "Lagos Island Photowalk",
  date: "Sat 20 Sept",
  name: "Amaka Eze",
  avatarUrl: null,
  rowNote: "Nut allergy",
  line: "Photowalk · Sat 20 Sept, 16:00",
  money: "2 places · ₦20,000",
  guests: 2,
  gross: "₦20,000",
  net: "₦17,000",
  status: "Waiting on you",
  isRequest: true,
  deadline: "You have 2 hours to answer this",
  notes: "Nut allergy",
  contact: "Tomorrow at 16:00",
  facts: [{ label: "Guests", value: "2" }],
  timeline: [],
  cancelNote: null,
  ...over,
});

const vm = (over: Partial<HostBookingsViewModel> = {}): HostBookingsViewModel => ({
  header: { title: "Bookings", subtitle: "", actions: [] },
  query: "",
  onQuery: vi.fn(),
  resultLine: "All 2 bookings",
  hasFilters: false,
  onClearFilters: vi.fn(),
  groups: [{ key: "status", label: "Status", current: "Any", active: false, anyValue: "All", anyLabel: "Any status", options: [{ value: "Upcoming", label: "Upcoming", selected: false, subs: [] }] }],
  onPick: vi.fn(),
  scanHref: "/host/dashboard/bookings/scan",
  rows: [
    { booking: booking(), chip: "In review" },
    { booking: booking({ id: "b6", ref: "MJ-4488", name: "Yemi Balogun", rowNote: "", status: "Confirmed", net: "₦15,300" }), chip: "Live" },
  ],
  none: false,
  onShowEverything: vi.fn(),
  onOpen: vi.fn(),
  detail: null,
  onCloseDetail: vi.fn(),
  onAccept: vi.fn(),
  onSayNo: vi.fn(),
  onReportNoShow: vi.fn(),
  ...over,
});

describe("HostBookingsView, the table", () => {
  it("shows a row per booking with who, what, when and the money", () => {
    renderWithProviders(<HostBookingsView vm={vm()} />);

    expect(screen.getAllByRole("row")).toHaveLength(3);
    for (const heading of ["Reference", "Guest", "Listing", "Date", "Guests", "They pay", "You receive", "Status"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText("MJ-4502")).toBeInTheDocument();
    expect(screen.getByText("Amaka Eze")).toBeInTheDocument();
    expect(screen.getByText("Nut allergy")).toBeInTheDocument();
    expect(screen.getAllByText("Lagos Island Photowalk")).toHaveLength(2);
    expect(screen.getByText("₦17,000")).toHaveClass("font-medium");
    expect(screen.getByText("Waiting on you")).toHaveClass("text-[#B4760A]");
    expect(screen.getByText("Confirmed")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText(/Requests you have not answered sit at the top/)).toBeInTheDocument();
  });

  it("opens a booking by clicking its row", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostBookingsView vm={props} />);

    await user.click(screen.getByRole("row", { name: /Yemi Balogun/ }));
    expect(props.onOpen).toHaveBeenCalledWith("b6");
  });

  it("says there are no bookings, and offers to show everything", async () => {
    const props = vm({ rows: [], none: true });
    const { user } = renderWithProviders(<HostBookingsView vm={props} />);

    expect(screen.getByText("No bookings here")).toBeInTheDocument();
    expect(screen.getByText(/you get a WhatsApp the same minute/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show everything" }));
    expect(props.onShowEverything).toHaveBeenCalled();
  });
});

describe("HostBookingsView, the toolbar", () => {
  it("searches, shows the count, and links to the scanner", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostBookingsView vm={props} />);

    expect(screen.getByText("All 2 bookings")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search bookings" }), "m");
    expect(props.onQuery).toHaveBeenCalledWith("m");
    expect(screen.getByRole("link", { name: "Scan tickets" })).toHaveAttribute("href", "/host/dashboard/bookings/scan");
    // Scanning is for a phone at the door: hidden on a desktop screen.
    expect(screen.getByRole("link", { name: "Scan tickets" })).toHaveClass("lg:hidden");
  });

  it("only offers Clear filters when a filter is on, and picks from a dropdown", async () => {
    const { rerender, user } = renderWithProviders(<HostBookingsView vm={vm()} />);
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    const props = vm({ hasFilters: true });
    rerender(<HostBookingsView vm={props} />);
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(props.onClearFilters).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Status: Any" }));
    await user.click(await screen.findByRole("button", { name: "Upcoming" }));
    expect(props.onPick).toHaveBeenCalledWith("status", "Upcoming", undefined);
  });
});
