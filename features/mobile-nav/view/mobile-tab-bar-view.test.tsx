import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { MobileTab } from "../view-model/use-mobile-tab-bar-view-model";
import { MobileTabBarView } from "./mobile-tab-bar-view";

const tabs: MobileTab[] = [
  { id: "home", label: "Home", href: "/", active: true },
  { id: "search", label: "Search", href: null, active: false },
  { id: "wishlists", label: "Wishlists", href: "/wishlists", active: false },
  { id: "trips", label: "Trips", href: "/my-experiences", active: false },
  { id: "profile", label: "Profile", href: "/profile", active: false },
];

describe("MobileTabBarView", () => {
  it("links each tab and marks the current one", () => {
    renderWithProviders(<MobileTabBarView visible tabs={tabs} onOpenSearch={vi.fn()} />);

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Wishlists" })).toHaveAttribute("href", "/wishlists");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("opens search from the Search tab", async () => {
    const onOpenSearch = vi.fn();
    const { user } = renderWithProviders(<MobileTabBarView visible tabs={tabs} onOpenSearch={onOpenSearch} />);

    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onOpenSearch).toHaveBeenCalled();
  });

  it("renders nothing where it's hidden", () => {
    const { container } = renderWithProviders(<MobileTabBarView visible={false} tabs={tabs} onOpenSearch={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
