import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostListing } from "../model/listings.types";
import type { HostListingsViewModel } from "../view-model/use-host-listings-view-model";
import { HostListingsView } from "./host-listings-view";

const listing = (over: Partial<HostListing> = {}): HostListing => ({
  id: "l1",
  imageUrl: "/a.jpg",
  title: "Lagos Island Photowalk",
  sub: "Lagos Island · 3 hours",
  cat: "Art & creativity",
  subcat: "Photography walk",
  status: "Live",
  price: 10000,
  next: "Sat 20 Sept",
  bookings: "6 of 8",
  rating: "4.9",
  future: 4,
  ...over,
});

const row = (l: HostListing, selected = false) => ({
  listing: l,
  selected,
  price: "₦10,000",
  actions: [
    { action: "edit" as const, label: "Edit", danger: false },
    { action: "delete" as const, label: "Delete", danger: true },
  ],
});

const vm = (over: Partial<HostListingsViewModel> = {}): HostListingsViewModel => ({
  header: { title: "Your listings", subtitle: "", actions: [] },
  isEmpty: false,
  newListingHref: "/host/dashboard/listings/new",
  query: "",
  onQuery: vi.fn(),
  resultLine: "All 2 listings",
  hasFilters: false,
  onClearFilters: vi.fn(),
  groups: [
    { key: "status", label: "Status", current: "Any", active: false, options: [{ value: "Live", label: "Live", selected: false, subs: [] }] },
    {
      key: "category",
      label: "Category",
      current: "Any",
      active: false,
      options: [{ value: "Yoga", label: "Yoga", selected: false, subs: [{ value: "Hot yoga", selected: false }] }],
    },
    { key: "rating", label: "Rating", current: "Any", active: false, options: [{ value: "4 and up", label: "4 and up", selected: false, subs: [] }] },
  ],
  onPick: vi.fn(),
  columns: [
    { key: "title", label: "Listing", direction: null },
    { key: "cat", label: "Category", direction: null },
    { key: "status", label: "Status", direction: null },
    { key: "price", label: "Price", direction: null },
    { key: "next", label: "Next date", direction: "asc" },
    { key: "bookings", label: "Booked", direction: null },
    { key: "rating", label: "Rating", direction: null },
  ],
  onSort: vi.fn(),
  rows: [row(listing()), row(listing({ id: "l2", title: "Sunset Kayak and Paint", status: "In review" }))],
  noMatches: false,
  onShowEverything: vi.fn(),
  selection: {
    count: 0,
    label: "0 listings selected",
    allSelected: false,
    onToggleAll: vi.fn(),
    onToggleRow: vi.fn(),
    onClear: vi.fn(),
    onBulk: vi.fn(),
  },
  onRowAction: vi.fn(),
  dialog: null,
  onCloseDialog: vi.fn(),
  onDialogConfirm: vi.fn(),
  ...over,
});

describe("HostListingsView, the table", () => {
  it("shows a row per listing with its details", () => {
    renderWithProviders(<HostListingsView vm={vm()} />);

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(screen.getByText("Lagos Island Photowalk")).toBeInTheDocument();
    expect(screen.getAllByText("Photography walk")).toHaveLength(2);
    expect(screen.getByText("Live")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("In review")).toHaveClass("text-[#B4760A]");
    expect(screen.getAllByText("₦10,000")).toHaveLength(2);
    expect(screen.getAllByText("6 of 8")).toHaveLength(2);
    expect(screen.getByText("Click a column to sort. Tick rows to hide, pause or archive several at once.")).toBeInTheDocument();
  });

  it("sorts by clicking a column and marks the sorted one", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    expect(screen.getByRole("columnheader", { name: /Next date/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: "Price" })).toHaveAttribute("aria-sort", "none");

    await user.click(screen.getByRole("button", { name: "Price" }));
    expect(props.onSort).toHaveBeenCalledWith("price");
  });

  it("selects one row, or all of them", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    await user.click(screen.getByRole("checkbox", { name: "Select Sunset Kayak and Paint" }));
    expect(props.selection.onToggleRow).toHaveBeenCalledWith("l2");
    await user.click(screen.getByRole("checkbox", { name: "Select all listings" }));
    expect(props.selection.onToggleAll).toHaveBeenCalled();
  });

  it("shows the selected rows ticked", () => {
    renderWithProviders(<HostListingsView vm={vm({ rows: [row(listing(), true)], selection: { ...vm().selection, count: 1, allSelected: true } })} />);
    expect(screen.getByRole("checkbox", { name: "Select Lagos Island Photowalk" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("checkbox", { name: "Select all listings" })).toHaveAttribute("aria-checked", "true");
  });

  it("opens a row's menu and runs the action picked", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    await user.click(screen.getByRole("button", { name: "Actions for Lagos Island Photowalk" }));
    await user.click(await screen.findByRole("button", { name: "Edit" }));

    expect(props.onRowAction).toHaveBeenCalledWith(expect.objectContaining({ id: "l1" }), "edit");
  });

  it("styles Delete as a danger action", async () => {
    const { user } = renderWithProviders(<HostListingsView vm={vm()} />);
    await user.click(screen.getByRole("button", { name: "Actions for Lagos Island Photowalk" }));
    expect(await screen.findByRole("button", { name: "Delete" })).toHaveClass("text-[#F5032D]");
  });

  it("says nothing matches, and offers to show everything", async () => {
    const props = vm({ rows: [], noMatches: true });
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    expect(screen.getByText("Nothing matches that")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show everything" }));
    expect(props.onShowEverything).toHaveBeenCalled();
  });
});

describe("HostListingsView, the toolbar", () => {
  it("searches, and shows the result count", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    expect(screen.getByText("All 2 listings")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search your listings" }), "k");
    expect(props.onQuery).toHaveBeenCalledWith("k");
  });

  it("only offers Clear filters when a filter is on", async () => {
    const { rerender } = renderWithProviders(<HostListingsView vm={vm()} />);
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    const props = vm({ hasFilters: true });
    rerender(<HostListingsView vm={props} />);
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("picks a status from its dropdown, including Any", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    await user.click(screen.getByRole("button", { name: "Status: Any" }));
    await user.click(await screen.findByRole("button", { name: "Live" }));
    expect(props.onPick).toHaveBeenCalledWith("status", "Live", undefined);

    await user.click(screen.getByRole("button", { name: "Status: Any" }));
    await user.click(await screen.findByRole("button", { name: "Any status" }));
    expect(props.onPick).toHaveBeenLastCalledWith("status", "All", undefined);
  });

  it("opens a category's subcategories and picks one", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    await user.click(screen.getByRole("button", { name: "Category: Any" }));
    expect(screen.queryByRole("button", { name: "Hot yoga" })).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Show Yoga subcategories" }));
    await user.click(await screen.findByRole("button", { name: "Hot yoga" }));

    expect(props.onPick).toHaveBeenCalledWith("category", "Yoga", "Hot yoga");
  });

  it("shows what's chosen on the dropdown button, shortening a long value", () => {
    renderWithProviders(
      <HostListingsView
        vm={vm({
          groups: [
            { key: "category", label: "Category", current: "Football and street games", active: true, options: [] },
            { key: "rating", label: "Rating", current: "4 and up", active: true, options: [] },
          ],
        })}
      />,
    );
    expect(screen.getByText("Football and street …")).toBeInTheDocument();
    expect(screen.getByText("4 and up")).toBeInTheDocument();
  });
});

describe("HostListingsView, selected rows", () => {
  it("swaps the toolbar for the bulk bar", async () => {
    const props = vm({ selection: { ...vm().selection, count: 2, label: "2 listings selected" } });
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByText("2 listings selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Pause new bookings" }));
    expect(props.selection.onBulk).toHaveBeenCalledWith("pause");
    await user.click(screen.getByRole("button", { name: "Hide from search" }));
    await user.click(screen.getByRole("button", { name: "Archive" }));
    expect(props.selection.onBulk).toHaveBeenCalledTimes(3);
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(props.selection.onClear).toHaveBeenCalled();
  });
});

describe("HostListingsView, no listings at all", () => {
  it("offers a first listing instead of a table", () => {
    renderWithProviders(<HostListingsView vm={vm({ isEmpty: true, rows: [] })} />);

    expect(screen.getByRole("heading", { name: "Nothing here yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a new listing" })).toHaveAttribute("href", "/host/dashboard/listings/new");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("HostListingsView, delete dialogs", () => {
  it("won't delete a listing with bookings to come, and suggests hiding", async () => {
    const props = vm({ dialog: { kind: "blocked", title: "Lagos Island Photowalk", upcoming: 4 } });
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("You cannot delete this one yet")).toBeInTheDocument();
    expect(within(dialog).getByText(/has 4 bookings still to come/)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeDisabled();

    await user.click(within(dialog).getByRole("button", { name: "Hide it instead" }));
    expect(props.onDialogConfirm).toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "Leave it alone" }));
    expect(props.onCloseDialog).toHaveBeenCalled();
  });

  it("says it with one booking", async () => {
    renderWithProviders(<HostListingsView vm={vm({ dialog: { kind: "blocked", title: "Boat", upcoming: 1 } })} />);
    expect(await screen.findByText(/has 1 booking still to come/)).toBeInTheDocument();
    expect(screen.getByText(/cancel it and every guest/)).toBeInTheDocument();
  });

  it("warns what deleting loses, and offers archiving", async () => {
    const props = vm({ dialog: { kind: "ok", title: "Harmattan Portrait Session", rating: "4.9" } });
    const { user } = renderWithProviders(<HostListingsView vm={props} />);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete Harmattan Portrait Session for good")).toBeInTheDocument();
    expect(within(dialog).getByText(/the 4.9 rating attached to it/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Delete and lose the reviews" }));
    await user.click(within(dialog).getByRole("button", { name: "Archive it instead" }));
    expect(props.onDialogConfirm).toHaveBeenCalledTimes(2);
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(props.onCloseDialog).toHaveBeenCalled();
  });

  it("leaves out the rating when there isn't one", async () => {
    renderWithProviders(<HostListingsView vm={vm({ dialog: { kind: "ok", title: "Night Market Walk", rating: null } })} />);
    expect(await screen.findByText(/past bookings and reviews\. That cannot be undone/)).toBeInTheDocument();
  });
});
