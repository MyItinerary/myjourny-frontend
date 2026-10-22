import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ListingFilterChip } from "../view-model/use-listing-filters-view-model";
import { ListingFiltersView } from "./listing-filters-view";

const chip = (overrides: Partial<ListingFilterChip> = {}): ListingFilterChip => ({
  id: "price",
  name: "Price",
  label: "Price",
  active: false,
  open: false,
  options: [
    { id: "under-5000", label: "Under ₦5,000", selected: false },
    { id: "over-25000", label: "Over ₦25,000", selected: false },
  ],
  ...overrides,
});

const handlers = () => ({ onToggle: vi.fn(), onSelect: vi.fn(), onClose: vi.fn(), onClearAll: vi.fn() });

describe("ListingFiltersView", () => {
  it("opens a chip's options and picks one", async () => {
    const vm = handlers();
    const { user, rerender } = renderWithProviders(<ListingFiltersView chips={[chip()]} activeCount={0} {...vm} />);

    await user.click(screen.getByRole("button", { name: "Price" }));
    expect(vm.onToggle).toHaveBeenCalledWith("price");

    rerender(<ListingFiltersView chips={[chip({ open: true })]} activeCount={0} {...vm} />);
    const panel = screen.getByRole("dialog", { name: "Price" });
    expect(panel).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Over ₦25,000" }));
    expect(vm.onSelect).toHaveBeenCalledWith("price", "over-25000");

    await user.click(screen.getByRole("button", { name: "Close filters" }));
    expect(vm.onClose).toHaveBeenCalled();
  });

  it("shows the picked option on the chip and lets every filter be cleared", async () => {
    const vm = handlers();
    const { user } = renderWithProviders(
      <ListingFiltersView chips={[chip({ label: "Under ₦5,000", active: true })]} activeCount={1} {...vm} />,
    );

    expect(screen.getByRole("button", { name: "Under ₦5,000" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(vm.onClearAll).toHaveBeenCalled();
  });
});
