import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ListingDetail } from "../model/listing-detail.types";
import type { HostListingDetailViewModel } from "../view-model/use-host-listing-detail-view-model";
import { HostListingDetailView } from "./host-listing-detail-view";

const detail = (over: Partial<ListingDetail> = {}): ListingDetail => ({
  id: "l1",
  hook: "Three hours, six streets",
  desc: "We start at the yellow gate.",
  inc: ["A photographer", "Ten edited photos"],
  exc: ["Transport"],
  cue: "the yellow gate beside Freedom Park",
  area: "Lagos Island · Freedom Park",
  guests: 8,
  price: 10000,
  payNote: "Smallest group you will run is 3.",
  cadence: "Saturdays at 16:00",
  stats: [{ label: "Booked this month", value: "14 places", note: "across 3 Saturdays" }],
  dates: [
    { date: "Sat 20 Sept", when: "Tomorrow, 16:00", taken: 6, cap: 8 },
    { date: "Sat 27 Sept", when: "In 8 days, 16:00", taken: 8, cap: 8 },
  ],
  noDates: "Dates appear here once the listing is approved.",
  noReviews: "Reviews show up after your first guests have been.",
  reviews: [],
  rules: [],
  actions: [],
  ...over,
});

const listing = {
  id: "l1", imageUrl: "/images/home/cities/lagos.jpg", title: "Lagos Island Photowalk", sub: "Lagos Island · 3 hours",
  cat: "Art & creativity", subcat: "Photography walk", status: "Live" as const, price: 10000, next: "Sat 20 Sept", bookings: "6 of 8", rating: "4.9", future: 4,
};

const vm = (id = "l1", over: Partial<HostListingDetailViewModel> = {}): HostListingDetailViewModel => {
  const d = detail({ id });
  return {
    header: { title: listing.title, subtitle: "", actions: [] },
    notFound: false,
    listingsHref: "/host/dashboard/listings",
    calendarHref: "/host/dashboard/calendar",
    listing,
    detail: d,
    banner: null,
    stats: d.stats,
    dates: d.dates.map((d) => ({ date: d.date, when: d.when, seats: `${d.taken} of ${d.cap} booked`, percent: 50, full: d.taken === d.cap, onGuests: vi.fn() })),
    tabs: (["About", "Reviews", "Rules and settings"] as const).map((tab) => ({ tab, active: tab === "About", onSelect: vi.fn() })),
    tab: "About",
    reviews: [{ name: "Ifeoma A.", stars: "★★★★★", when: "3 days ago", text: "Lovely." }],
    rules: [{ label: "How people book", value: "Request to book" }],
    next: { title: "Sat 20 Sept", meta: "Tomorrow, 16:00 · 6 of 8 booked", cue: d.cue, onGuests: vi.fn() },
    pay: { line: "8 guests at ₦10,000", gross: "₦80,000", commission: "₦12,000", net: "₦68,000", percent: 15 },
    meetCue: "The yellow gate beside Freedom Park",
    actions: [{ label: "Edit this listing", onClick: vi.fn() }],
    ...over,
  };
};

describe("the listing detail", () => {
  it("shows stats, dates, the next date, what the host keeps and where they meet", async () => {
    const props = vm();
    renderWithProviders(<HostListingDetailView vm={props} />);

    expect(screen.getByText("14 places")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All listings" })).toHaveAttribute("href", "/host/dashboard/listings");
    expect(screen.getByRole("link", { name: "Open the calendar" })).toHaveAttribute("href", "/host/dashboard/calendar");
    expect(screen.getAllByRole("button", { name: /See guests for/ })).toHaveLength(2);
    expect(screen.getByText("Sold out")).toBeInTheDocument();

    const next = screen.getByRole("region", { name: "Next date" });
    await userEvent.click(within(next).getByRole("button", { name: "See the guest list" }));
    expect(props.next!.onGuests).toHaveBeenCalled();

    expect(within(screen.getByRole("region", { name: "What one full group pays you" })).getByText("₦68,000")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Where you meet" })).getByText("The yellow gate beside Freedom Park")).toBeInTheDocument();

    await userEvent.click(within(screen.getByRole("region", { name: "Manage this listing" })).getByRole("button", { name: "Edit this listing" }));
    expect(props.actions[0].onClick).toHaveBeenCalled();
  });

  it("shows a status banner whose button works", async () => {
    const onButton = vi.fn();
    renderWithProviders(<HostListingDetailView vm={vm("l8", { banner: { tone: "red", title: "Not approved yet", body: "Two things to fix.", button: "Fix and resubmit", onButton } })} />);
    expect(screen.getByText("Not approved yet")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fix and resubmit" }));
    expect(onButton).toHaveBeenCalled();
  });

  it("explains an empty schedule and hides the guest list when nothing is coming", () => {
    renderWithProviders(<HostListingDetailView vm={vm("l2", { dates: [], next: null })} />);
    expect(screen.getByText(/Dates appear here once the listing is approved/)).toBeInTheDocument();
    expect(screen.getByText("Nothing coming up")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "See the guest list" })).not.toBeInTheDocument();
  });

  it("selects tabs", async () => {
    const props = vm();
    renderWithProviders(<HostListingDetailView vm={props} />);
    await userEvent.click(screen.getByRole("tab", { name: "Reviews" }));
    expect(props.tabs[1].onSelect).toHaveBeenCalled();
    expect(screen.getByRole("tab", { name: "About" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Included")).toBeInTheDocument();
    expect(screen.getByText("Not included")).toBeInTheDocument();
  });

  it("lists reviews, or says there are none", () => {
    const { unmount } = renderWithProviders(<HostListingDetailView vm={vm("l1", { tab: "Reviews" })} />);
    expect(screen.getByText("Ifeoma A.")).toBeInTheDocument();
    unmount();
    renderWithProviders(<HostListingDetailView vm={vm("l2", { tab: "Reviews", reviews: [] })} />);
    expect(screen.getByText(/Reviews show up after your first guests/)).toBeInTheDocument();
  });

  it("lists the rules and settings", () => {
    renderWithProviders(<HostListingDetailView vm={vm("l1", { tab: "Rules and settings" })} />);
    expect(screen.getByText("How people book")).toBeInTheDocument();
    expect(screen.getByText("Request to book")).toBeInTheDocument();
  });

  it("says when the listing isn't there", () => {
    renderWithProviders(<HostListingDetailView vm={vm("l1", { notFound: true, listing: null, detail: null })} />);
    expect(screen.getByRole("heading", { name: /couldn.t find that listing/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your listings" })).toHaveAttribute("href", "/host/dashboard/listings");
  });
});
