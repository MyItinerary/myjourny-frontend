import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HOME_SECTION_IDS } from "../model/home-sections.types";
import type { HomeViewModel } from "../view-model/use-home-view-model";
import { HomeView } from "./home-view";

vi.mock("@/components/motion/reveal", () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("./home-browse-view", () => ({ HomeBrowseView: () => <section aria-label="Browse everything" /> }));
vi.mock("@/components/home/newsletter-section", () => ({ NewsletterSection: () => <section aria-label="Newsletter" /> }));
vi.mock("@/features/footer", () => ({ Footer: () => <footer /> }));
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
    pickUp: rail(true),
    basedOnSearch: { ...rail(true), area: "Lekki" },
    tonightAndThisWeekend: rail(true),
    pickedForYou: rail(true),
    localFoodAndDrinks: rail(true),
    earlyBird: rail(true),
    newOnMyJourny: rail(true),
    unforgettableTravel: rail(true),
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
      "Pick up where you left off",
      "Based on your search in Lekki",
      "Tonight and this weekend",
      "Picked for your taste",
      "Dive deeper into Local food & drinks",
      "Cities",
      "Early bird ending soon",
      "New on MyJourny",
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
          pickUp: rail(false),
          cities: { cities: [], show: false },
        })}
      />,
    );

    expect(screen.queryByRole("region", { name: "Pick up where you left off" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Cities" })).not.toBeInTheDocument();
  });

  it("leaves out 'Based on your search' until an area has been searched", () => {
    renderWithProviders(<HomeView {...viewModel({ basedOnSearch: { ...rail(false), area: null } })} />);

    expect(screen.queryByRole("region", { name: /Based on your search/ })).not.toBeInTheDocument();
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
});
