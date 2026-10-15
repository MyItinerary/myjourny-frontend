import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EMPTY_PITCH, EXAMPLES, EXAMPLES_COPY, SELL_POINTS } from "../model/home-copy";
import { SAMPLE_HOME } from "../model/sample-home";
import type { HostHomeViewModel } from "../view-model/use-host-home-view-model";
import { HostHomeView } from "./host-home-view";

const base = {
  header: { title: "Good afternoon, Tunde", subtitle: "", actions: [] },
  newListingHref: "/host/dashboard/listings/new",
  listingsHref: "/host/dashboard/listings",
  bookingsHref: "/host/dashboard/bookings",
  quick: [
    { label: "List an experience", href: "/host/dashboard/listings/new" },
    { label: "Report a problem with a booking", href: "/host/dashboard/bookings" },
  ],
  pitch: EMPTY_PITCH,
  examples: { ...EXAMPLES_COPY, items: EXAMPLES },
  sellPoints: SELL_POINTS,
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
