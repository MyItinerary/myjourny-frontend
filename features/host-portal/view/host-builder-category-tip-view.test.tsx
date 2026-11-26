import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostBuilderCategoryTipView } from "./host-builder-category-tip-view";

describe("HostBuilderCategoryTipView", () => {
  it("explains categories, subcategories and tags, and links to support", () => {
    render(<HostBuilderCategoryTipView />);
    const tip = screen.getByRole("complementary", { name: "Why categories and tags matter" });

    expect(within(tip).getByRole("heading", { name: "Why this matters" })).toBeInTheDocument();
    expect(within(tip).getByText(/which pages your experience shows up on/)).toBeInTheDocument();
    expect(within(tip).getByText(/narrow it down/)).toBeInTheDocument();
    expect(within(tip).getByText(/guests who are ready to book/)).toBeInTheDocument();
    expect(within(tip).getByRole("link", { name: "Contact support" })).toHaveAttribute("href", "mailto:support@myjourny.app");
  });
});
