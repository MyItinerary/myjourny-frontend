import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { FooterViewModel } from "../view-model/use-footer-view-model";
import { FooterView } from "./footer-view";

const build = (over: Partial<FooterViewModel> = {}): FooterViewModel => ({
  tabs: [
    { id: 1, label: "Local food & drinks", active: true },
    { id: 2, label: "Culture & history", active: false },
  ],
  isLoadingTabs: false,
  onSelectTab: vi.fn(),
  subcategories: [{ id: 5, label: "Street food & markets", href: "/categories/street-food" }],
  isLoadingSubcategories: false,
  columns: [{ heading: "Support", links: ["Help Center"] }],
  legalLinks: ["Privacy policy"],
  socialLinks: [{ label: "LinkedIn", src: "/icons/footer/linkedin.svg", width: 18 }],
  year: 2026,
  ...over,
});

describe("FooterView", () => {
  it("renders tabs, subcategory links, columns, legal row and socials", () => {
    renderWithProviders(<FooterView {...build()} />);
    expect(screen.getByRole("tab", { name: "Culture & history" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Street food & markets/ })).toHaveAttribute("href", "/categories/street-food");
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Help Center")).toBeInTheDocument();
    expect(screen.getByText(/© 2026 Myjourny, Inc\./)).toBeInTheDocument();
    expect(screen.getByText("Privacy policy")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
  });

  it("selects a tab on click", async () => {
    const onSelectTab = vi.fn();
    const { user } = renderWithProviders(<FooterView {...build({ onSelectTab })} />);
    await user.click(screen.getByRole("tab", { name: "Culture & history" }));
    expect(onSelectTab).toHaveBeenCalledWith(2);
  });

  it("hides tabs and links while loading", () => {
    renderWithProviders(<FooterView {...build({ isLoadingTabs: true, isLoadingSubcategories: true })} />);
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByText("Street food & markets")).not.toBeInTheDocument();
  });
});
