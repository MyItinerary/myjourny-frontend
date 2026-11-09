import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { buildResultsVm, withFilters } from "@/test/utils/search-results-vm";

import { ResultsFilterRowView } from "./results-filter-row-view";


describe("ResultsFilterRowView", () => {
  it("shows More filters, Dates and the categories, with no icons on the chips", () => {
    renderWithProviders(<ResultsFilterRowView {...buildResultsVm()} />);

    for (const name of ["More filters", "Dates", "Local food & drinks", "Music & live shows"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    for (const name of ["Time of day", "Price", "Duration", "Languages"]) {
      expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
    }
    // Category chips carry no icon on the page (the panel keeps them).
    expect(screen.getByRole("button", { name: "Music & live shows" }).querySelector("svg")).toBeNull();
  });

  it("opens the filters panel and shows the badge count", async () => {
    const openPanel = vi.fn();
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ openPanel, filterCount: 3 })} />);

    await user.click(screen.getByRole("button", { name: /More filters\s*3/ }));
    expect(openPanel).toHaveBeenCalled();
  });

  it("toggles a category and opens the Dates dropdown", async () => {
    const toggleCategory = vi.fn();
    const toggleDropdown = vi.fn();
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ toggleCategory, toggleDropdown })} />);

    await user.click(screen.getByRole("button", { name: "Culture & history" }));
    expect(toggleCategory).toHaveBeenCalledWith("culture-history");
    await user.click(screen.getByRole("button", { name: "Dates" }));
    expect(toggleDropdown).toHaveBeenCalledWith("dates");
  });

  it("shows a selected category first, with a remove button", async () => {
    const toggleCategory = vi.fn();
    const filters = withFilters({ categories: ["culture-history"] });
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters, toggleCategory })} />);

    expect(screen.getAllByRole("button", { pressed: true })[0]).toHaveTextContent("Culture & history");
    await user.click(screen.getByRole("button", { name: "Remove Culture & history" }));
    expect(toggleCategory).toHaveBeenCalledWith("culture-history");
  });

  it("shows no dot on any chip", () => {
    renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ tookQuiz: true })} />);
    expect(screen.queryAllByRole("img", { name: "For you" })).toHaveLength(0);
  });

  it("keeps the taste-quiz prompt out of the row, even with a category selected", () => {
    const filters = withFilters({ categories: ["local-food-drinks"] });
    renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters })} />);

    expect(screen.queryByText(/taste quiz/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Make it mine/ })).not.toBeInTheDocument();
  });

  it("shows the type as an active chip and clears it from the X", async () => {
    const clearChip = vi.fn();
    const filters = withFilters({ types: ["events"] });
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters, clearChip })} />);

    expect(screen.getByRole("button", { name: "Age limit" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Events" }));
    expect(clearChip).toHaveBeenCalledWith("type");
  });

  it("shows the chosen dates with their value and clears them from the X", async () => {
    const clearChip = vi.fn();
    const filters = withFilters({ dateRange: { start: new Date(2030, 10, 12), end: new Date(2030, 10, 21) } });
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters, clearChip })} />);

    await user.click(screen.getByRole("button", { name: "Remove 12 Nov – 21 Nov" }));
    expect(clearChip).toHaveBeenCalledWith("dates");
  });

  it("after the quiz, offers subcategories as the filters and toggles one on a click", async () => {
    const toggleSubcategory = vi.fn();
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ tookQuiz: true, toggleSubcategory })} />);

    expect(screen.queryByRole("button", { name: "Culture & history" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cafés & coffee culture" }));
    expect(toggleSubcategory).toHaveBeenCalledWith("cafes-coffee-culture");
  });

  it("shows a selected subcategory pressed, removable with its X, and never adds a second row", async () => {
    const toggleSubcategory = vi.fn();
    const filters = withFilters({ subcategories: ["cafes-coffee-culture"] });
    const { user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters, tookQuiz: true, toggleSubcategory })} />);

    expect(screen.getByRole("button", { name: /Cafés & coffee culture/, pressed: true })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^All / })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Cafés & coffee culture" }));
    expect(toggleSubcategory).toHaveBeenCalledWith("cafes-coffee-culture");
  });

  it("without the quiz, shows categories and never subcategories", () => {
    const filters = withFilters({ categories: ["local-food-drinks"] });
    renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ filters })} />);

    expect(screen.getByRole("button", { name: "Culture & history" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cafés & coffee culture" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^All / })).not.toBeInTheDocument();
  });

  it("is the nav's glass on mobile from the start, so it's never see-through over the results", () => {
    const { container } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm()} />);

    expect(container.firstElementChild).toHaveClass("max-lg:bg-[rgba(255,255,255,0.93)]", "max-lg:backdrop-blur-md");
  });

  it("counts as stuck when it's within a pixel and a half of where it sticks", () => {
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ top: 97.4 } as DOMRect);
    const style = vi.spyOn(window, "getComputedStyle").mockReturnValue({ top: "96px" } as CSSStyleDeclaration);
    const { container } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm()} />);

    expect(container.firstElementChild).toHaveClass("shadow-[0_-10px_0_0_rgba(255,255,255,0.93),0_4px_20px_rgba(0,0,0,0.05)]");
    rect.mockRestore();
    style.mockRestore();
  });

  it("drops the row's blur on mobile while the date sheet is open, so the sheet stays pinned to the screen", () => {
    // Stuck under the header, as when the page has scrolled.
    const rect = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({ top: 0 } as DOMRect);
    const { container, rerender } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm()} />);
    const band = () => container.firstElementChild as HTMLElement;

    expect(band()).toHaveClass("backdrop-blur-md");
    // Stuck, it extends a strip of glass up under the header so a scroll lag on phones can't show a gap.
    expect(band().className).toContain("shadow-[0_-10px_0_0_rgba(255,255,255,0.93)");
    expect(band()).not.toHaveClass("max-md:backdrop-blur-none");

    rerender(<ResultsFilterRowView {...buildResultsVm({ openDropdown: "dates" })} />);
    expect(band()).toHaveClass("max-md:backdrop-blur-none");
    rect.mockRestore();
  });

  it("opens the date picker, and the type's own dropdowns, under the chips", async () => {
    const toggleOption = vi.fn();
    const { rerender, user } = renderWithProviders(<ResultsFilterRowView {...buildResultsVm({ openDropdown: "dates" })} />);
    expect(screen.getByRole("dialog", { name: "Dates" })).toBeInTheDocument();

    rerender(
      <ResultsFilterRowView
        {...buildResultsVm({ filters: withFilters({ types: ["experiences"] }), openDropdown: "duration", toggleOption })}
      />,
    );
    await user.click(within(screen.getByRole("dialog", { name: "Duration" })).getByRole("button", { name: "Half day" }));
    expect(toggleOption).toHaveBeenCalledWith("duration", "half_day");
  });
});
