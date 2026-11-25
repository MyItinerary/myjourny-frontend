import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeRailView } from "./home-rail-view";

vi.mock("@/components/wishlists/wishlist-save-provider", () => ({
  useWishlistSave: () => ({ openSave: vi.fn() }),
}));
vi.mock("@/lib/queries/wishlists", () => ({
  useMyWishlistedIds: () => ({ data: new Set<string>() }),
}));

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

const item = (title: string, id?: string) => ({
  id,
  imageSrc: "/images/home/experiences/kayaking.jpg",
  imageAlt: title,
  category: "BEACH",
  title,
  duration: "1 hour",
  rating: 4,
  reviewCount: 3,
  priceFrom: 10000,
});

describe("HomeRailView", () => {
  it("shows the heading and a card for each item, linking real ones to their page", () => {
    renderWithProviders(
      <HomeRailView heading="Happening near you" items={[item("Kayaking", "exp-1"), item("Placeholder")]} />,
    );

    expect(screen.getByRole("heading", { name: "Happening near you" })).toBeInTheDocument();
    expect(screen.getByText("Kayaking")).toBeInTheDocument();
    expect(screen.getByText("Placeholder")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kayaking" })).toHaveAttribute("href", "/experiences/exp-1");
    expect(screen.queryByRole("link", { name: "Placeholder" })).not.toBeInTheDocument();
  });

  it("greys the lead-in of a two-part heading", () => {
    renderWithProviders(<HomeRailView mutedHeading="Local food & drinks" heading="experiences" items={[item("A")]} />);

    expect(screen.getByRole("heading", { name: "Local food & drinks experiences" })).toBeInTheDocument();
    expect(screen.getByText(/Local food & drinks/)).toHaveClass("text-[#6F6B72]");
  });

  it("has previous and next arrows", () => {
    renderWithProviders(<HomeRailView heading="Top picks right now" items={[item("A")]} />);

    expect(screen.getByRole("button", { name: /previous slide/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeInTheDocument();
  });

  it("shows 'See more' only when it has somewhere to go", () => {
    const { rerender } = renderWithProviders(<HomeRailView heading="Top picks" items={[item("A")]} />);
    expect(screen.queryByText("See more")).not.toBeInTheDocument();

    rerender(<HomeRailView heading="Top picks" items={[item("A")]} seeMoreHref="/popular-experiences" />);
    expect(screen.getByText("See more").closest("a")).toHaveAttribute("href", "/popular-experiences");
  });

  it("shows no cards while loading", () => {
    renderWithProviders(<HomeRailView heading="Top picks" items={[item("A")]} isLoading />);

    expect(screen.queryByText("A")).not.toBeInTheDocument();
  });
});
