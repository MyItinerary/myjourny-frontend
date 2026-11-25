import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { PosterEvent } from "../model/discovery-events.types";
import { EventPosterRailView } from "./event-poster-rail-view";

const POPULAR_EVENTS_TODAY: PosterEvent[] = [
  {
    id: "afro-futures-summit",
    category: "Talks & conferences",
    title: "Afro Futures Summit",
    dateLabel: "Sat 14 Nov · 9:00 AM",
    priceLabel: "Early bird · from ₦8,000",
    imageSrc: "/images/events/poster-1.png",
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

describe("EventPosterRailView", () => {
  it("shows each event's category, title, date and price under the heading", () => {
    renderWithProviders(<EventPosterRailView heading="Popular events happening today" events={POPULAR_EVENTS_TODAY} />);

    expect(screen.getByRole("heading", { name: "Popular events happening today" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Afro Futures Summit" })).toBeInTheDocument();
    expect(screen.getByText("Sat 14 Nov · 9:00 AM")).toBeInTheDocument();
    expect(screen.getByText("Early bird · from ₦8,000")).toBeInTheDocument();
    expect(screen.getByText("Talks & conferences")).toBeInTheDocument();
  });
});
