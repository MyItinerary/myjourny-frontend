import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HOME_SECTION_IDS } from "../model/home-sections.types";
import type { HomeViewModel } from "../view-model/use-home-view-model";
import { HomeView } from "./home-view";

vi.mock("@/components/motion/reveal", () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("./home-browse-view", () => ({ HomeBrowseView: () => <section aria-label="Browse everything" /> }));
vi.mock("@/components/home/newsletter-section", () => ({ NewsletterSection: () => <section aria-label="Newsletter" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer /> }));
vi.mock("./home-taste-quiz-popup-view", () => ({ HomeTasteQuizPopupView: () => <aside aria-label="Taste quiz popup" /> }));
vi.mock("./home-hero-view", () => ({ HomeHeroView: () => <header aria-label="Hero" /> }));
vi.mock("./home-cities-view", () => ({ HomeCitiesView: () => <section aria-label="Cities" /> }));
vi.mock("./home-rail-view", () => ({
  HomeRailView: ({ heading, mutedHeading }: { heading: string; mutedHeading?: string }) => (
    <section aria-label={[mutedHeading, heading].filter(Boolean).join(" ")} />
  ),
}));

const rail = (show: boolean) => ({ items: [], isLoading: false, show });

function viewModel(overrides: Partial<HomeViewModel> = {}): HomeViewModel {
  return {
    hero: {} as never,
    happeningNear: rail(true),
    popularEvents: rail(true),
    topPicks: rail(true),
    exploreLagos: rail(true),
    cultureAndHistory: rail(true),
    localFoodAndDrinks: rail(true),
    unforgettableTravel: rail(true),
    browsingHistory: rail(false),
    tasteQuizPopup: { visible: true, href: "/onboarding", onDismiss: () => {} },
    cities: { cities: [], show: true },
    ...overrides,
  };
}

describe("HomeView", () => {
  it("lays the sections out in the order of the design", () => {
    renderWithProviders(<HomeView {...viewModel()} />);

    const labels = screen
      .getAllByRole("region")
      .map((section) => section.getAttribute("aria-label"))
      .filter(Boolean);
    expect(labels).toEqual([
      "Happening near you",
      "Popular events you should check out",
      "Top picks right now",
      "Explore Lagos intentionally",
      "Culture & history experiences",
      "Local food & drinks experiences",
      "Cities",
      "Browse everything",
      "Unforgettable travel experiences",
      "Newsletter",
    ]);
    expect(screen.getByRole("heading", { name: "Why book with us?" })).toBeInTheDocument();
  });

  it("leaves out rails and sections that have nothing to show", () => {
    renderWithProviders(
      <HomeView
        {...viewModel({
          happeningNear: rail(false),
          cities: { cities: [], show: false },
        })}
      />,
    );

    expect(screen.queryByRole("region", { name: "Happening near you" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cities" })).not.toBeInTheDocument();
  });

  it("marks the newsletter, so the taste-quiz popup knows where to stop", () => {
    renderWithProviders(<HomeView {...viewModel()} />);

    expect(document.getElementById(HOME_SECTION_IDS.newsletter)).toContainElement(
      screen.getByRole("region", { name: "Newsletter" }),
    );
  });

  it("has no 'Discover by categories' section", () => {
    renderWithProviders(<HomeView {...viewModel()} />);

    expect(screen.queryByRole("region", { name: /categories/i })).not.toBeInTheDocument();
  });

  it("shows browsing history after the travel rail for signed-in users", () => {
    renderWithProviders(<HomeView {...viewModel({ browsingHistory: rail(true) })} />);

    const labels = screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));
    expect(labels.indexOf("Based on your browsing history")).toBe(labels.indexOf("Unforgettable travel experiences") + 1);
  });
});
