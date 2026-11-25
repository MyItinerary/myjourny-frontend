import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { MobileTab } from "../view-model/use-mobile-tab-bar-view-model";
import { MobileTabBarView } from "./mobile-tab-bar-view";

const tabs: MobileTab[] = [
  { id: "home", label: "Home", href: "/", icon: "/icons/nav/home.png", active: true },
  { id: "experiences", label: "Experiences", href: "/experiences", icon: "/icons/nav/experiences.png", active: false },
  { id: "events", label: "Events", href: "/events", icon: "/icons/nav/events.png", active: false },
  { id: "wishlists", label: "My wishlists", href: "/wishlists", icon: "/icons/nav/wishlist.png", active: false },
];

describe("MobileTabBarView", () => {
  it("links each section and marks the current one", () => {
    renderWithProviders(<MobileTabBarView visible tabs={tabs} />);

    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "My wishlists" })).toHaveAttribute("href", "/wishlists");
    expect(screen.getByRole("link", { name: "Experiences" })).not.toHaveAttribute("aria-current");
  });

  it("renders nothing where it's hidden", () => {
    const { container } = renderWithProviders(<MobileTabBarView visible={false} tabs={tabs} />);
    expect(container).toBeEmptyDOMElement();
  });
});
