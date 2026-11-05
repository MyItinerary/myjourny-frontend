import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { DiscoveryHeroView } from "./discovery-hero-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Main" /> }));
vi.mock("@/features/search", () => ({ SearchBarView: () => <div role="search" /> }));

describe("DiscoveryHeroView", () => {
  it("shows the title, sub-line, nav and search bar", () => {
    renderWithProviders(
      <DiscoveryHeroView hero={{ search: {} as never, isScrolled: false, onOpenMobileSearch: vi.fn() }} title="Hello" subtitle="World" titleWidth={600} />,
    );
    expect(screen.getByRole("heading", { name: "Hello" })).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("opens the mobile search sheet from the phone search button", async () => {
    const onOpenMobileSearch = vi.fn();
    const { user } = renderWithProviders(
      <DiscoveryHeroView hero={{ search: {} as never, isScrolled: false, onOpenMobileSearch }} title="t" subtitle="s" titleWidth={600} />,
    );
    await user.click(screen.getByRole("button", { name: /search destinations/i }));
    expect(onOpenMobileSearch).toHaveBeenCalled();
  });
});
