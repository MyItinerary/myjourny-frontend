import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostSidebarViewModel } from "../view-model/use-host-sidebar-view-model";
import { HostSidebarView } from "./host-sidebar-view";

const NAV = [
  ["dashboard", "Dashboard", "dash", "/host/dashboard"],
  ["listings", "Listings", "list", "/host/dashboard/listings"],
  ["calendar", "Calendar", "cal", "/host/dashboard/calendar"],
  ["bookings", "Bookings", "book", "/host/dashboard/bookings"],
  ["earnings", "Earnings", "earn", "/host/dashboard/earnings"],
  ["profile", "Profile", "prof", "/host/dashboard/profile"],
  ["help", "Help", "help", "/host/dashboard/help"],
] as const;

const vm = (overrides: Partial<HostSidebarViewModel> = {}, active = "dashboard", badges: Record<string, string> = {}): HostSidebarViewModel => ({
  open: true,
  onToggle: vi.fn(),
  items: NAV.map(([key, label, icon, href]) => ({ key, label, icon, href, active: key === active, badge: badges[key] ?? null })),
  host: {
    name: "Tunde Bakare",
    photoUrl: null,
    initials: "TB",
    status: { label: "Verified host", tone: "green", glyph: "seal", dotOnAvatar: false },
    loading: false,
  },
  ...overrides,
});

describe("HostSidebarView, expanded", () => {
  it("shows the logo, the seven items and the host card", () => {
    renderWithProviders(<HostSidebarView {...vm()} />);

    expect(screen.getByAltText("Myjourny")).toBeInTheDocument();
    expect(screen.getByText("myjourny")).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual([
      "Dashboard", "Listings", "Calendar", "Bookings", "Earnings", "Profile", "Help",
    ]);
    expect(screen.getByText("Tunde Bakare")).toBeInTheDocument();
    expect(screen.getByText("Verified host")).toBeInTheDocument();
  });

  it("links each item to its page and marks the current one", () => {
    renderWithProviders(<HostSidebarView {...vm({}, "bookings")} />);

    expect(screen.getByRole("link", { name: "Bookings" })).toHaveAttribute("href", "/host/dashboard/bookings");
    expect(screen.getByRole("link", { name: "Bookings" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Listings" })).not.toHaveAttribute("aria-current");
  });

  it("draws every glyph filled, not stroked", () => {
    const { container } = renderWithProviders(<HostSidebarView {...vm()} />);
    const paths = container.querySelectorAll("nav svg path");

    expect(paths).toHaveLength(7);
    paths.forEach((path) => {
      expect(path).toHaveAttribute("fill", "currentColor");
      expect(path).toHaveAttribute("transform");
      expect(path.getAttribute("stroke")).toBeNull();
    });
  });

  it("shows counts as pills, growing for 99+", () => {
    renderWithProviders(<HostSidebarView {...vm({}, "dashboard", { listings: "3", bookings: "99+" })} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("99+")).toHaveClass("px-1.5");
    expect(screen.getByText("3")).not.toHaveClass("px-1.5");
  });

  it("collapses with the toggle", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostSidebarView {...props} />);

    const toggle = screen.getByRole("button", { name: "Collapse the menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    await user.click(toggle);

    expect(props.onToggle).toHaveBeenCalled();
  });

  it("shows the other verification states", () => {
    const { rerender } = renderWithProviders(
      <HostSidebarView {...vm({ host: { ...vm().host, status: { label: "Under review", tone: "amber", glyph: "clock", dotOnAvatar: true } } })} />,
    );
    expect(screen.getByText("Under review").closest("p")).toHaveClass("text-[#B4760A]");
    rerender(
      <HostSidebarView {...vm({ host: { ...vm().host, status: { label: "More info needed", tone: "red", glyph: "alert", dotOnAvatar: true } } })} />,
    );
    expect(screen.getByText("More info needed").closest("p")).toHaveClass("text-[#F5032D]");
  });

  it("has no status line until verification is known, and a photo when there is one", () => {
    renderWithProviders(<HostSidebarView {...vm({ host: { ...vm().host, status: null, photoUrl: "/tunde.jpg" } })} />);

    expect(screen.queryByText("Verified host")).not.toBeInTheDocument();
    expect(document.querySelector("img[src*='tunde']")).not.toBeNull();
  });

  it("shows shimmer bars while the host loads", () => {
    const { container } = renderWithProviders(<HostSidebarView {...vm({ host: { ...vm().host, loading: true } })} />);

    expect(screen.queryByText("Tunde Bakare")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });
});

describe("HostSidebarView, collapsed", () => {
  it("keeps only the toggle in the header and labels each item", () => {
    renderWithProviders(<HostSidebarView {...vm({ open: false })} />);

    expect(screen.queryByText("myjourny")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Myjourny")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand the menu" })).toHaveAttribute("aria-expanded", "false");
    // The visible text is gone, so each link keeps its label for assistive tech, plus a tooltip.
    expect(screen.getByRole("link", { name: "Bookings" })).toHaveAttribute("aria-label", "Bookings");
    expect(screen.getAllByRole("tooltip").map((t) => t.textContent)).toContain("Bookings");
  });

  it("swaps count pills for a dot", () => {
    const { container } = renderWithProviders(<HostSidebarView {...vm({ open: false }, "dashboard", { bookings: "2" })} />);

    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(container.querySelectorAll("nav [aria-hidden].rounded-full")).toHaveLength(1);
  });

  it("shows the avatar only, with a status dot when attention is needed", () => {
    const { container } = renderWithProviders(
      <HostSidebarView
        {...vm({ open: false, host: { ...vm().host, status: { label: "More info needed", tone: "red", glyph: "alert", dotOnAvatar: true } } })}
      />,
    );

    expect(screen.queryByText("Tunde Bakare")).not.toBeInTheDocument();
    expect(screen.getByText("TB")).toBeInTheDocument();
    expect(container.querySelector("aside > div:last-child .bg-\\[\\#F5032D\\]")).not.toBeNull();
  });
});
