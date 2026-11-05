import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ExperiencesPageViewModel } from "../view-model/use-experiences-page-view-model";
import { ExperiencesPageView } from "./experiences-page-view";

vi.mock("@/components/motion/reveal", () => ({ Reveal: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/home/newsletter-section", () => ({ NewsletterSection: () => <section aria-label="Newsletter" /> }));
vi.mock("@/features/footer", () => ({ Footer: () => <footer /> }));
vi.mock("./discovery-hero-view", () => ({
  DiscoveryHeroView: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <header aria-label={title}>{subtitle}</header>
  ),
}));
vi.mock("./category-pills-view", () => ({ CategoryPillsView: () => <section aria-label="Discover by categories" /> }));
vi.mock("@/features/home", () => ({
  HomeRailView: ({ heading }: { heading: string }) => <section aria-label={heading} />,
  HomeCitiesView: ({ heading }: { heading: string }) => <section aria-label={heading} />,
}));

const rail = (show: boolean) => ({ items: [], isLoading: false, show });

function viewModel(overrides: Partial<ExperiencesPageViewModel> = {}): ExperiencesPageViewModel {
  return {
    hero: {} as never,
    pickUp: rail(true),
    basedOnSearch: { ...rail(true), area: "Lekki" },
    availableThisWeekend: rail(true),
    pickedForYou: rail(true),
    nearYouInLagos: rail(true),
    categories: [],
    cities: { cities: [], show: true },
    ...overrides,
  };
}

describe("ExperiencesPageView", () => {
  it("lays the sections out in the order of the design", () => {
    renderWithProviders(<ExperiencesPageView {...viewModel()} />);

    expect(screen.getByLabelText("Experiences worth showing up for")).toBeInTheDocument();
    expect(screen.getByText("Tours, tastings, workshops, and hidden spots, hosted by locals.")).toBeInTheDocument();
    const labels = screen.getAllByRole("region").map((section) => section.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Pick up where you left off",
      "Based on your search in Lekki",
      "Available this weekend",
      "Picked for your taste",
      "Near you in Lagos",
      "Discover by categories",
      "Discover experiences by cities",
      "Newsletter",
    ]);
  });

  it("leaves out rails and sections that have nothing to show", () => {
    renderWithProviders(
      <ExperiencesPageView {...viewModel({ pickUp: rail(false), basedOnSearch: { ...rail(false), area: null }, pickedForYou: rail(false), cities: { cities: [], show: false } })} />,
    );

    expect(screen.queryByRole("region", { name: "Pick up where you left off" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Picked for your taste" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Discover experiences by cities" })).not.toBeInTheDocument();
  });
});
