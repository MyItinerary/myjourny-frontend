import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostHomeData } from "../model/home.types";
import type { HostHomeViewModel } from "../view-model/use-host-home-view-model";
import { HostHomeView } from "./host-home-view";

const SAMPLE_HOME: HostHomeData = {
  stats: [
    { label: "Bookings coming up", value: "4", note: "6 guests tomorrow", tone: "muted" },
    { label: "Earned this month", value: "₦248,000", note: "up from ₦180,000 in August", tone: "green" },
  ],
  attention: [
    { id: "b1", title: "Amaka Eze wants 2 places on Saturday", sub: "Request to book", timer: "2h left", urgent: true, action: "Open", href: "/host/dashboard/bookings" },
    { id: "b2", title: "Chidi Okafor has been waiting 2 days", sub: "Request to book", timer: "Late", urgent: false, action: "Open", href: "/host/dashboard/bookings" },
    { id: "l1", title: "Lagos Island Photowalk is missing photos", sub: "It cannot go live", timer: "2 to fix", urgent: false, action: "Finish it", href: "/host/dashboard/listings/new" },
  ],
  listings: [
    { id: "l1", imageUrl: "/a.jpg", status: "Live", title: "Lagos Island Photowalk", meta: "Sat 20 Sept · 6 of 8 booked", href: "/host/dashboard/listings/new" },
    { id: "l2", imageUrl: "/b.jpg", status: "In review", title: "Sunset Kayak and Paint", meta: "Sent 2 days ago", href: "/host/dashboard/listings/new" },
    { id: "l3", imageUrl: "/c.jpg", status: "Archived", title: "Harmattan Portrait Session", meta: "Ran 11 times", href: "/host/dashboard/listings" },
  ],
  earnings: {
    total: "₦1,046,000",
    months: [
      { month: "Apr", amountK: 96 },
      { month: "May", amountK: 132 },
      { month: "Jun", amountK: 158 },
      { month: "Jul", amountK: 204 },
      { month: "Aug", amountK: 180 },
      { month: "Sep", amountK: 248 },
    ],
  },
  next: {
    title: "Lagos Island Photowalk",
    when: "Tomorrow, Sat 20 Sept · 16:00 · 3 hours",
    guests: "6 of 8",
    payout: "₦51,000",
    meeting: "Meeting at the yellow gate",
    href: "/host/dashboard/bookings",
  },
  reviews: [
    { name: "Ifeoma A.", stars: 5, when: "3 days ago", text: "Left with eleven pictures I actually like." },
    { name: "Segun O.", stars: 5, when: "last week", text: "Found the gate immediately." },
  ],
};

const EXAMPLE_ITEMS = [
  { imageUrl: "/1.jpg", eyebrow: "Art & creativity", title: "Golden hour portrait walk", sub: "Six people.", money: "8 guests × ₦10,000 = ₦80,000" },
  { imageUrl: "/2.jpg", eyebrow: "Street life", title: "Market to plate, on camera", sub: "Two hours.", money: "6 guests × ₦12,000 = ₦72,000" },
  { imageUrl: "/3.jpg", eyebrow: "Water activity", title: "Boat morning, film only", sub: "One boat.", money: "5 guests × ₦18,000 = ₦90,000" },
];

const base = {
  header: { title: "Good afternoon, Tunde", subtitle: "", actions: [] },
  newListingHref: "/host/dashboard/listings/new",
  listingsHref: "/host/dashboard/listings",
  bookingsHref: "/host/dashboard/bookings",
  quick: [
    { label: "List an experience", href: "/host/dashboard/listings/new" },
    { label: "Report a problem with a booking", href: "/host/dashboard/bookings" },
  ],
  pitch: {
    eyebrow: "You are approved",
    heading: "You already know how to do the thing, now sell it to eight people at once.",
    body: "A private shoot is one client.",
    cta: "Create your first experience",
  },
  examples: { heading: "Three that work in your category", body: "Photography, Lagos.", items: EXAMPLE_ITEMS },
  sellPoints: [
    { n: "1", title: "Sell the feeling, not the schedule", body: "Nobody books six locations." },
    { n: "2", title: "One landmark beats any address", body: "The yellow gate." },
    { n: "3", title: "Price the seat, not your day", body: "Work out your day rate." },
  ],
};

const full: HostHomeViewModel = { ...base, kind: "full", data: SAMPLE_HOME };
const empty: HostHomeViewModel = { ...base, kind: "empty" };

describe("HostHomeView, a host with listings", () => {
  it("shows the four numbers", () => {
    renderWithProviders(<HostHomeView {...full} />);

    for (const stat of SAMPLE_HOME.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
    }
    expect(screen.getByText("up from ₦180,000 in August")).toHaveClass("text-[#0CBA65]");
  });

  it("lists what needs them today, urgent first in red", () => {
    renderWithProviders(<HostHomeView {...full} />);

    const section = screen.getByRole("heading", { name: "Needs you today" }).closest("section")!;
    expect(within(section).getByText("3")).toBeInTheDocument();
    expect(within(section).getByText("Amaka Eze wants 2 places on Saturday")).toBeInTheDocument();
    expect(within(section).getByText("2h left")).toHaveClass("text-[#F5032D]");
    expect(within(section).getByText("Late")).toHaveClass("text-[#6F6B72]");
    expect(within(section).getAllByRole("link", { name: "Open" })[0]).toHaveClass("bg-[#F5032D]");
    expect(within(section).getByRole("link", { name: "Finish it" })).toHaveAttribute("href", "/host/dashboard/listings/new");
  });

  it("shows the listings with a status chip each, and links to all of them", () => {
    renderWithProviders(<HostHomeView {...full} />);

    expect(screen.getByText("Live")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("In review")).toHaveClass("text-[#B4760A]");
    expect(screen.getByText("Archived")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See all" })).toHaveAttribute("href", "/host/dashboard/listings");
    expect(screen.getByText("Sat 20 Sept · 6 of 8 booked")).toBeInTheDocument();
  });

  it("draws six months of earnings with the latest in red", () => {
    const { container } = renderWithProviders(<HostHomeView {...full} />);

    expect(screen.getByText("₦1,046,000")).toBeInTheDocument();
    expect(screen.getByText("₦248k")).toBeInTheDocument();
    const bars = container.querySelectorAll("section .rounded-lg.max-w-14");
    expect(bars).toHaveLength(6);
    expect(bars[5]).toHaveClass("bg-[#F5032D]");
    expect((bars[5] as HTMLElement).style.height).toBe("104px");
    expect((bars[0] as HTMLElement).style.height).toBe(`${Math.round((96 / 248) * 104)}px`);
  });

  it("shows the next experience, reviews and quick actions", () => {
    renderWithProviders(<HostHomeView {...full} />);

    expect(screen.getByText("Next experience")).toBeInTheDocument();
    expect(screen.getByText("6 of 8")).toBeInTheDocument();
    expect(screen.getByText("₦51,000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the guest list" })).toHaveAttribute("href", "/host/dashboard/bookings");
    expect(screen.getByText("Ifeoma A.")).toBeInTheDocument();
    expect(screen.getAllByLabelText("5 stars")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Report a problem with a booking/ })).toHaveAttribute("href", "/host/dashboard/bookings");
  });

  it("leaves out the next-experience card when nothing is coming up", () => {
    renderWithProviders(<HostHomeView {...full} kind="full" data={{ ...SAMPLE_HOME, next: null }} />);
    expect(screen.queryByText("Next experience")).not.toBeInTheDocument();
  });
});

describe("HostHomeView, a host with nothing listed", () => {
  it("pitches the first experience", () => {
    renderWithProviders(<HostHomeView {...empty} />);

    expect(screen.getByText("You are approved")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /sell it to eight people at once/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create your first experience" })).toHaveAttribute("href", "/host/dashboard/listings/new");
  });

  it("offers three examples to start from, and three selling points", () => {
    renderWithProviders(<HostHomeView {...empty} />);

    expect(screen.getByText("Three that work in your category")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Start from this" })).toHaveLength(3);
    expect(screen.getByText("8 guests × ₦10,000 = ₦80,000")).toBeInTheDocument();
    expect(screen.getByText("What makes one sell")).toBeInTheDocument();
    expect(screen.getByText("Sell the feeling, not the schedule")).toBeInTheDocument();
    expect(screen.queryByText("Needs you today")).not.toBeInTheDocument();
  });
});
