import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { DiscoverEvent } from "../model/discovery-events.types";
import { EventRailView } from "./event-rail-view";

const EARLY_BIRD_EVENTS: DiscoverEvent[] = [
  {
    id: "afro-futures",
    title: "Afro Futures Summit",
    month: "Nov",
    day: "14",
    whenLabel: "Sat 14 Nov · 9:00 AM",
    location: "Adeola Odeku Street, Victoria Island",
    priceLabel: "From ₦8,000",
    imageSrc: "/images/events/discover-jazz-brunch.png",
  },
];

// jsdom has none of the browser APIs the carousel (Embla) measures with.
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  vi.stubGlobal("IntersectionObserver", Observer);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
});

describe("EventRailView", () => {
  it("shows the date chip, place and price of each event", () => {
    renderWithProviders(<EventRailView heading="Early bird ending soon" events={EARLY_BIRD_EVENTS} />);

    expect(screen.getByRole("region", { name: "Early bird ending soon" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Afro Futures Summit" })).toBeInTheDocument();
    expect(screen.queryByText("Early bird")).not.toBeInTheDocument();
    expect(screen.queryByText("Curator pick")).not.toBeInTheDocument();
    expect(screen.getAllByText("Adeola Odeku Street, Victoria Island").length).toBeGreaterThan(0);
  });

  it("only has a See more button when given somewhere to go", () => {
    const { unmount } = renderWithProviders(<EventRailView heading="A" events={EARLY_BIRD_EVENTS} />);
    expect(screen.queryByText("See more")).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<EventRailView heading="A" events={EARLY_BIRD_EVENTS} seeMoreHref="/events" />);
    expect(screen.getByText("See more").closest("a")).toHaveAttribute("href", "/events");
  });
});
