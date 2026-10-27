import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ReviewsToolbarView } from "./reviews-toolbar-view";

const base = () => ({
  query: "",
  onQueryChange: vi.fn(),
  onClearQuery: vi.fn(),
  sort: "relevant" as const,
  sortLabel: "Most relevant",
  sortOptions: [
    { value: "relevant" as const, label: "Most relevant" },
    { value: "newest" as const, label: "Newest" },
  ],
  sortOpen: false,
  onToggleSort: vi.fn(),
  onCloseSort: vi.fn(),
  onSortChange: vi.fn(),
  filterOpen: false,
  onToggleFilter: vi.fn(),
  ratingFilter: null,
  onRatingFilter: vi.fn(),
  activeFilterCount: 0,
  onClearFilters: vi.fn(),
});

describe("ReviewsToolbarView", () => {
  it("searches and clears the search", async () => {
    const props = { ...base(), query: "kay" };
    renderWithProviders(<ReviewsToolbarView {...props} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Search reviews" }), "a");
    expect(props.onQueryChange).toHaveBeenCalledWith("kaya");
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(props.onClearQuery).toHaveBeenCalled();
  });

  it("has no clear button for an empty search", () => {
    renderWithProviders(<ReviewsToolbarView {...base()} />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("opens the sort menu and picks an option", async () => {
    const props = base();
    const { rerender } = renderWithProviders(<ReviewsToolbarView {...props} />);
    await userEvent.click(screen.getByRole("button", { name: /Most relevant/ }));
    expect(props.onToggleSort).toHaveBeenCalled();
    rerender(<ReviewsToolbarView {...props} sortOpen />);
    await userEvent.click(within(screen.getByRole("menu")).getByRole("menuitemradio", { name: "Newest" }));
    expect(props.onSortChange).toHaveBeenCalledWith("newest");
  });

  it("marks the current sort as checked", () => {
    renderWithProviders(<ReviewsToolbarView {...base()} sortOpen />);
    expect(screen.getByRole("menuitemradio", { name: "Most relevant" })).toHaveAttribute("aria-checked", "true");
  });

  it("closes the sort menu on Escape and on a click outside it", async () => {
    const props = { ...base(), sortOpen: true };
    renderWithProviders(<ReviewsToolbarView {...props} />);
    await userEvent.keyboard("{Escape}");
    expect(props.onCloseSort).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByLabelText("Search reviews"));
    expect(props.onCloseSort).toHaveBeenCalledTimes(2);
  });

  it("stays open for a click inside the menu", async () => {
    const props = { ...base(), sortOpen: true };
    renderWithProviders(<ReviewsToolbarView {...props} />);
    await userEvent.click(screen.getByRole("menu"));
    expect(props.onCloseSort).not.toHaveBeenCalled();
  });

  it("picks a star filter, shows it as active and removes it", async () => {
    const props = base();
    const { rerender } = renderWithProviders(<ReviewsToolbarView {...props} filterOpen />);
    await userEvent.click(screen.getByRole("button", { name: "1 star" }));
    expect(props.onRatingFilter).toHaveBeenCalledWith(1);
    rerender(<ReviewsToolbarView {...props} ratingFilter={4} activeFilterCount={1} />);
    expect(screen.getByRole("button", { name: "Filter · 1" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Remove 4 star filter" }));
    expect(props.onRatingFilter).toHaveBeenLastCalledWith(null);
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(props.onClearFilters).toHaveBeenCalled();
  });
});
