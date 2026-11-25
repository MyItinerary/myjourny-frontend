import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buildSearchSheetVm } from "@/test/utils/search-sheet-vm";
import { renderWithProviders } from "@/test/utils/render";

import { SearchSheetView } from "./search-sheet-view";

describe("SearchSheetView", () => {
  it("stacks Where open over When and Who rows that show their values", () => {
    renderWithProviders(<SearchSheetView {...buildSearchSheetVm({ whenSummary: "This weekend" })} />);

    const sheet = screen.getByRole("dialog", { name: "Search" });
    expect(within(sheet).getByRole("heading", { name: "Where to?" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "When This weekend" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "Who Add guests" })).toBeInTheDocument();
  });

  it("opens a card from its row and closes from the X", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<SearchSheetView {...vm} />);

    await user.click(screen.getByRole("button", { name: "Who Add guests" }));
    expect(vm.onOpenCard).toHaveBeenCalledWith("who");
    await user.click(screen.getByRole("button", { name: "Close search" }));
    expect(vm.onClose).toHaveBeenCalled();
  });

  it("shows every card as a row when none is open", () => {
    renderWithProviders(<SearchSheetView {...buildSearchSheetVm({ openCard: null, whereSummary: "Lekki" })} />);

    expect(screen.getByRole("button", { name: "Where Lekki" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("hides When and Who while typing in Where", () => {
    renderWithProviders(<SearchSheetView {...buildSearchSheetVm({ editing: true, whereQuery: "Lek" })} />);

    expect(screen.queryByRole("button", { name: /^When/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Who/ })).not.toBeInTheDocument();
  });

  it("clears everything and searches from the footer", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<SearchSheetView {...vm} />);

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(vm.onClearAll).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(vm.onSearch).toHaveBeenCalled();
  });

  it("keeps the Search button enabled with nothing filled, and marks it busy while searching", () => {
    const { rerender } = renderWithProviders(<SearchSheetView {...buildSearchSheetVm()} />);
    expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();

    rerender(<SearchSheetView {...buildSearchSheetVm({ searching: true })} />);
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-busy", "true");
  });

  it("sizes itself to the space above the keyboard once it's known", () => {
    renderWithProviders(<SearchSheetView {...buildSearchSheetVm({ viewportHeight: 480 })} />);
    expect(screen.getByRole("dialog", { name: "Search" })).toHaveStyle({ height: "480px" });
  });
});
