import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildSearchSheetVm } from "@/test/utils/search-sheet-vm";
import { renderWithProviders } from "@/test/utils/render";

import { WhenCardView, WhoCardView } from "./search-sheet-when-view";

describe("WhenCardView", () => {
  it("marks the picked quick pick and takes another", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<WhenCardView {...vm} />);

    expect(screen.getByRole("heading", { name: "When?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "This weekend" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(vm.onPickPreset).toHaveBeenCalledWith(vm.datePresets[2]);
  });

  it("greys out past days, circles the picked ones and picks a day", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<WhenCardView {...vm} />);

    expect(screen.getByText("November 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thursday, 19 November 2026" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saturday, 21 November 2026" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Monday, 23 November 2026" }));
    expect(vm.onPickDay).toHaveBeenCalledWith(vm.months[0].days[4].date);
  });

  it("notes Lagos time and skips the dates", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<WhenCardView {...vm} />);

    expect(screen.getByText("Times are in Lagos time (WAT).")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(vm.onSkipDates).toHaveBeenCalled();
  });
});

describe("WhoCardView", () => {
  it("counts adults, children and infants, as the search always has", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<WhoCardView {...vm} />);

    expect(screen.getByRole("heading", { name: "Who's coming?" })).toBeInTheDocument();
    expect(screen.getByText("Aged 13 or above")).toBeInTheDocument();
    expect(screen.getByText("Ages 2 - 12")).toBeInTheDocument();
    expect(screen.getByText("Under 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add children" }));
    expect(vm.onAddGuest).toHaveBeenCalledWith("children");
    await user.click(screen.getByRole("button", { name: "Remove adults" }));
    expect(vm.onRemoveGuest).toHaveBeenCalledWith("adults");
  });

  it("greys out minus with none to remove, and plus at 20 in all", () => {
    const at20 = buildSearchSheetVm().guestTypes.map((type) => ({ ...type, canAdd: false }));
    renderWithProviders(<WhoCardView {...buildSearchSheetVm({ guestTypes: at20 })} />);

    expect(screen.getByRole("button", { name: "Remove infants" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Remove adults" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Add adults" })).toBeDisabled();
  });
});
