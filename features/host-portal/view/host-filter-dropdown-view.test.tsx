import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { FilterGroup } from "../model/filter-group.types";
import { FilterDropdown } from "./host-filter-dropdown-view";

const group = (over: Partial<FilterGroup> = {}): FilterGroup => ({
  key: "when",
  label: "When",
  current: "Any",
  active: false,
  anyValue: "All dates",
  anyLabel: "All dates",
  options: [
    { value: "Today", label: "Today", selected: false, subs: [] },
    { value: "Tomorrow", label: "Tomorrow", selected: false, subs: [] },
  ],
  ...over,
});

describe("FilterDropdown", () => {
  it("shows what's chosen on the button", () => {
    renderWithProviders(<FilterDropdown group={group({ current: "Tomorrow", active: true })} onPick={vi.fn()} />);
    expect(screen.getByRole("button", { name: "When: Tomorrow" })).toBeInTheDocument();
  });

  it("opens, picks a value, and closes", async () => {
    const onPick = vi.fn();
    const { user } = renderWithProviders(<FilterDropdown group={group()} onPick={onPick} />);

    await user.click(screen.getByRole("button", { name: "When: Any" }));
    await user.click(await screen.findByRole("button", { name: "Today" }));

    expect(onPick).toHaveBeenCalledWith("when", "Today", undefined);
    expect(screen.queryByRole("button", { name: "Tomorrow" })).not.toBeInTheDocument();
  });

  it("clears with its own 'any' row, worded as the group says", async () => {
    const onPick = vi.fn();
    const { user } = renderWithProviders(<FilterDropdown group={group({ current: "Today", active: true })} onPick={onPick} />);

    await user.click(screen.getByRole("button", { name: "When: Today" }));
    await user.click(await screen.findByRole("button", { name: "All dates" }));

    expect(onPick).toHaveBeenCalledWith("when", "All dates", undefined);
  });
});
