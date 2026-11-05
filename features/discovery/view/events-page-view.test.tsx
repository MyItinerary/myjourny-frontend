import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { DiscoverEvent, PosterEvent } from "../model/discovery-events.types";
import type { EventsPageViewModel } from "../view-model/use-events-page-view-model";
import { EventsPageView } from "./events-page-view";

vi.mock("@/components/motion/reveal", () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/home/newsletter-section", () => ({ NewsletterSection: () => <section aria-label="Newsletter" /> }));
vi.mock("@/features/footer", () => ({ Footer: () => <footer /> }));
vi.mock("./discovery-hero-view", () => ({
  DiscoveryHeroView: ({ title, subtitle }: { title: string; subtitle: string }) => <header aria-label={title}>{subtitle}</header>,
}));
vi.mock("./category-pills-view", () => ({ CategoryPillsView: () => <section aria-label="Discover by categories" /> }));
vi.mock("./event-poster-rail-view", () => ({
  EventPosterRailView: ({ heading }: { heading: string }) => <section aria-label={heading} />,
}));
vi.mock("./event-rail-view", () => ({ EventRailView: ({ heading }: { heading: string }) => <section aria-label={heading} /> }));

const poster: PosterEvent = {
  id: "p1",
  category: "Music",
  title: "Poster",
  dateLabel: "Sat",
  priceLabel: "Free",
  imageSrc: "/images/events/poster-1.png",
};
const event: DiscoverEvent = {
  id: "e1",
  title: "Event",
  month: "Nov",
  day: "1",
  whenLabel: "Sun",
  location: "Lagos",
  priceLabel: "Free",
  imageSrc: "/images/events/discover-jazz-brunch.png",
};

function viewModel(overrides: Partial<EventsPageViewModel> = {}): EventsPageViewModel {
  return {
    hero: {} as never,
    popularToday: [poster],
    thisWeekend: [event],
    earlyBird: [event],
    basedOnSearch: { area: "Lekki", events: [event] },
    pickedForYou: [event],
    nextWeek: [event],
    categories: [],
    ...overrides,
  };
}

describe("EventsPageView", () => {
  it("opens with the events headline and sub-line", () => {
    renderWithProviders(<EventsPageView {...viewModel()} />);
    expect(screen.getByLabelText("Events you won’t miss for anything")).toBeInTheDocument();
    expect(screen.getByText("Concerts, conferences, meetups, and nights out across Nigeria.")).toBeInTheDocument();
  });

  it("lays the sections out in the order of the design", () => {
    renderWithProviders(<EventsPageView {...viewModel()} />);

    const labels = screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Popular events happening today",
      "This weekend",
      "Early bird ending soon",
      "Based on your search in Lekki",
      "Picked for your taste",
      "Discover by categories",
      "Happening Next week",
      "Newsletter",
    ]);
  });

  it("leaves out 'Based on your search' until an area has been searched", () => {
    renderWithProviders(<EventsPageView {...viewModel({ basedOnSearch: null })} />);

    expect(screen.queryByRole("region", { name: /Based on your search/ })).not.toBeInTheDocument();
  });

  it("leaves out 'Picked for your taste' when there is nothing picked yet", () => {
    renderWithProviders(<EventsPageView {...viewModel({ pickedForYou: [] })} />);

    expect(screen.queryByRole("region", { name: "Picked for your taste" })).not.toBeInTheDocument();
  });
});
