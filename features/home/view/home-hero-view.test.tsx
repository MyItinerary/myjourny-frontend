import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeHeroView } from "./home-hero-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Primary" /> }));
vi.mock("@/features/search", () => ({ SearchBarView: () => <div data-testid="hero-search" /> }));

const search = {} as never;

describe("HomeHeroView", () => {
  it("shows the headline, sub-line, nav and search bar", () => {
    renderWithProviders(<HomeHeroView search={search} isScrolled={false} onOpenMobileSearch={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Find things worth doing. Here or anywhere." })).toBeInTheDocument();
    expect(screen.getByText("Experiences and events picked to match your taste.")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByTestId("hero-search")).toBeInTheDocument();
  });

  it("opens the phone search sheet from the compact search button", async () => {
    const onOpenMobileSearch = vi.fn();
    const { user } = renderWithProviders(
      <HomeHeroView search={search} isScrolled={false} onOpenMobileSearch={onOpenMobileSearch} />,
    );

    await user.click(screen.getByRole("button", { name: /search destinations or activities/i }));

    expect(onOpenMobileSearch).toHaveBeenCalledOnce();
  });

  it("stops the search bar taking clicks once the page has scrolled", () => {
    renderWithProviders(<HomeHeroView search={search} isScrolled onOpenMobileSearch={vi.fn()} />);

    expect(screen.getByTestId("hero-search").parentElement).toHaveClass("pointer-events-none");
  });
});
