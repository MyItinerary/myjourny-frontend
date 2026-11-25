import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { buildSearchSheetVm } from "@/test/utils/search-sheet-vm";
import { renderWithProviders } from "@/test/utils/render";

import type { SheetMatchGroup } from "../view-model/use-search-sheet-view-model";
import { WhereCardView } from "./search-sheet-where-view";

const groups: SheetMatchGroup[] = [
  {
    key: "areas",
    label: "Areas",
    rows: [
      { key: "area-Lekki", kind: "area", title: [{ text: "Lek", match: true }, { text: "ki", match: false }], subtitle: "Area in Lagos", onSelect: vi.fn() },
    ],
  },
  {
    key: "events",
    label: "Events",
    rows: [
      {
        key: "event-carnival",
        kind: "event",
        title: [{ text: "Lek", match: true }, { text: "ki street carnival", match: false }],
        subtitle: "Sat 21 Nov · Admiralty Way",
        onSelect: vi.fn(),
      },
    ],
  },
];

describe("WhereCardView", () => {
  it("lists recent searches, Nearby, the destinations, the popular areas and the activities", async () => {
    const recent = { key: "recent-Lekki", title: "Lekki", subtitle: "This weekend · 2 guests", icon: "place" as const, onSelect: vi.fn() };
    const vm = buildSearchSheetVm({ recentSearches: [recent] });
    const { user } = renderWithProviders(<WhereCardView {...vm} />);

    expect(screen.getByText("Recent searches")).toBeInTheDocument();
    expect(screen.getByText("This weekend · 2 guests")).toBeInTheDocument();
    expect(screen.getByText("Suggested")).toBeInTheDocument();
    expect(screen.getByText("Destinations")).toBeInTheDocument();
    expect(screen.getByText("28 experiences")).toBeInTheDocument();
    expect(screen.getByText("Popular areas in Lagos")).toBeInTheDocument();
    expect(screen.getByText("Activities & experiences")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(vm.onClearRecentSearches).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Nearby/ }));
    expect(vm.nearby.onSelect).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Yaba" }));
    expect(vm.popularAreas[1].onSelect).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Abuja, Nigeria/ }));
    expect(vm.destinations[1].onSelect).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Local food & drinks/ }));
    expect(vm.activities[0].onSelect).toHaveBeenCalled();
  });

  it("has no recent searches section on a first visit", () => {
    renderWithProviders(<WhereCardView {...buildSearchSheetVm()} />);
    expect(screen.queryByText("Recent searches")).not.toBeInTheDocument();
  });

  it("ends with the taste quiz row only for people who haven't taken it", () => {
    const { rerender } = renderWithProviders(<WhereCardView {...buildSearchSheetVm({ tasteQuizHref: "/onboarding" })} />);
    expect(screen.getByRole("link", { name: /Make it mine/ })).toHaveAttribute("href", "/onboarding");

    rerender(<WhereCardView {...buildSearchSheetVm()} />);
    expect(screen.queryByText("Make it mine.")).not.toBeInTheDocument();
  });

  it("starts typing from the field", async () => {
    const vm = buildSearchSheetVm();
    const { user } = renderWithProviders(<WhereCardView {...vm} />);

    await user.type(screen.getByRole("searchbox", { name: "Search destination or activities" }), "L");
    expect(vm.onWhereFocus).toHaveBeenCalled();
    expect(vm.onWhereChange).toHaveBeenCalledWith("L");
  });

  it("while typing, shows the matches with the typed letters bold, and can clear", async () => {
    const vm = buildSearchSheetVm({ editing: true, whereQuery: "Lek", matchGroups: groups });
    const { user, container } = renderWithProviders(<WhereCardView {...vm} />);

    expect(screen.queryByRole("heading", { name: "Where to?" })).not.toBeInTheDocument();
    expect(screen.getByText("Areas")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect([...container.querySelectorAll("b")].map((b) => b.textContent)).toEqual(["Lek", "Lek"]);

    await user.click(screen.getByRole("button", { name: /street carnival/ }));
    expect(groups[1].rows[0].onSelect).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(vm.onClearWhere).toHaveBeenCalled();
  });

  it("says when nothing matches", () => {
    renderWithProviders(<WhereCardView {...buildSearchSheetVm({ editing: true, whereQuery: "Qwzx", noMatch: true })} />);
    expect(screen.getByText("Nothing matches yet. Try an area or a category.")).toBeInTheDocument();
  });

  it("searches from the keyboard's search key", async () => {
    const vm = buildSearchSheetVm({ editing: true, whereQuery: "Lek" });
    const { user } = renderWithProviders(<WhereCardView {...vm} />);

    await user.type(screen.getByRole("searchbox"), "{Enter}");
    expect(vm.onSearch).toHaveBeenCalled();
  });
});
