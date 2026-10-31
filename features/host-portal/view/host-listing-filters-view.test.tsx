import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostListingsViewModel } from "../view-model/use-host-listings-view-model";
import { BulkBar, Toolbar } from "./host-listing-filters-view";

const vm = (over: Partial<HostListingsViewModel> = {}) =>
  ({
    query: "",
    onQuery: vi.fn(),
    resultLine: "3 listings",
    hasFilters: true,
    onClearFilters: vi.fn(),
    groups: [{ key: "rating", label: "Rating", current: "4 and up", active: true, anyValue: "All", anyLabel: "Any rating", options: [{ value: "4 and up", label: "4 and up", selected: true, subs: [] }] }],
    onPick: vi.fn(),
    selection: { count: 1, label: "1 listing selected", allSelected: false, onToggleAll: vi.fn(), onToggleRow: vi.fn(), onClear: vi.fn(), onBulk: vi.fn() },
    ...over,
  }) as unknown as HostListingsViewModel;

describe("Toolbar", () => {
  it("shows the count and clears filters", async () => {
    const props = vm();
    const { user } = renderWithProviders(<Toolbar vm={props} />);

    expect(screen.getByText("3 listings")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(props.onClearFilters).toHaveBeenCalled();
  });

  it("marks a chosen filter on its dropdown and picks a value", async () => {
    const props = vm();
    const { user } = renderWithProviders(<Toolbar vm={props} />);

    await user.click(screen.getByRole("button", { name: "Rating: 4 and up" }));
    await user.click(await screen.findByRole("button", { name: "4 and up" }));

    expect(props.onPick).toHaveBeenCalledWith("rating", "4 and up", undefined);
  });
});

describe("BulkBar", () => {
  it("names how many are selected and runs a bulk action", async () => {
    const props = vm();
    const { user } = renderWithProviders(<BulkBar vm={props} />);

    expect(screen.getByText("1 listing selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide from search" }));
    expect(props.selection.onBulk).toHaveBeenCalledWith("hide");
  });
});
