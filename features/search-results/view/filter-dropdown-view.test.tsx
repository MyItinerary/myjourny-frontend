import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { buildResultsVm, withFilters } from "@/test/utils/search-results-vm";

import { FilterDropdownView } from "./filter-dropdown-view";

describe("FilterDropdownView", () => {
  it("renders nothing when no dropdown is open", () => {
    const { container } = renderWithProviders(<FilterDropdownView {...buildResultsVm()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("opens the date picker with two months, Tonight first, and applies or clears", async () => {
    const applyDates = vi.fn();
    const clearDates = vi.fn();
    const { user } = renderWithProviders(
      <FilterDropdownView
        {...buildResultsVm({
          openDropdown: "dates",
          draftRange: { start: new Date(2030, 10, 12), end: null },
          applyDates,
          clearDates,
        })}
      />,
    );

    expect(screen.getByText("November 2030")).toBeInTheDocument();
    expect(screen.getByText("December 2030")).toBeInTheDocument();
    expect(screen.getByText(/pick an end date/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^(Tonight|Tomorrow|This weekend|Next 7 days|Next weekend|Any date)$/ })[0]).toHaveTextContent("Tonight");

    await user.click(screen.getAllByRole("button", { name: /^Apply$|Show 50 experiences/ })[0]);
    expect(applyDates).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(clearDates).toHaveBeenCalled();
  });

  it("sets a multi-day preset as a range, a one-day preset as a day, and clears on Any date", async () => {
    const pickDatePreset = vi.fn();
    const clearDates = vi.fn();
    const closeDropdown = vi.fn();
    const { user } = renderWithProviders(
      <FilterDropdownView {...buildResultsVm({ openDropdown: "dates", pickDatePreset, clearDates, closeDropdown })} />,
    );

    await user.click(screen.getByRole("button", { name: "This weekend" }));
    const [start, end] = pickDatePreset.mock.calls[0];
    expect(start.getDay()).toBe(6);
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60 * 1000);

    await user.click(screen.getByRole("button", { name: "Tomorrow" }));
    expect(pickDatePreset.mock.calls[1][0]).toEqual(pickDatePreset.mock.calls[1][1]);

    await user.click(screen.getByRole("button", { name: "Any date" }));
    expect(clearDates).toHaveBeenCalled();
    expect(closeDropdown).toHaveBeenCalled();
  });

  it("lists languages with the ones that match nothing greyed", async () => {
    const toggleOption = vi.fn();
    const { user } = renderWithProviders(
      <FilterDropdownView
        {...buildResultsVm({
          filters: withFilters({ types: ["experiences"], languages: ["Yoruba"] }),
          openDropdown: "languages",
          toggleOption,
        })}
      />,
    );

    expect(screen.getByRole("button", { name: "Yoruba" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Hausa" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Igbo" }));
    expect(toggleOption).toHaveBeenCalledWith("languages", "Igbo");
  });

  it("offers the age limits for events", async () => {
    const toggleOption = vi.fn();
    const { user } = renderWithProviders(
      <FilterDropdownView
        {...buildResultsVm({ filters: withFilters({ types: ["events"] }), openDropdown: "age", toggleOption })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "21+" }));
    expect(toggleOption).toHaveBeenCalledWith("age", "21+");
  });
});
