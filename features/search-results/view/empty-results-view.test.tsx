import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EmptyResultsView } from "./empty-results-view";

describe("EmptyResultsView", () => {
  it("says no results were found and offers a way to get in touch", () => {
    renderWithProviders(<EmptyResultsView hasActiveFilters={false} onClearAll={vi.fn()} contactHref="/help" />);

    expect(screen.getByRole("heading", { name: "No results found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "get in touch" })).toHaveAttribute("href", "/help");
  });

  it("clears the filters", async () => {
    const onClearAll = vi.fn();
    const { user } = renderWithProviders(<EmptyResultsView hasActiveFilters onClearAll={onClearAll} />);

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClearAll).toHaveBeenCalled();
  });

  it("has no button when no filter is applied", () => {
    renderWithProviders(<EmptyResultsView hasActiveFilters={false} onClearAll={vi.fn()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
