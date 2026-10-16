import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  CATEGORY_TREE,
  filterListings,
  hasActiveFilters,
  listingsSummary,
  NO_FILTERS,
  priceLabel,
  RATING_OPTIONS,
  resultLine,
  rowActions,
  sortListings,
  STATUS_OPTIONS,
} from "../model/listing-table";
import { useHostListings } from "../model/listings-data";
import type {
  BulkAction,
  HostListing,
  ListingFilters,
  ListingRowAction,
  ListingSortKey,
} from "../model/listings.types";
import { HOST_PORTAL_BASE } from "../model/nav";
import type { HostPageHeader } from "./use-host-home-view-model";

export type FilterKey = "status" | "category" | "rating";

export type FilterOption = {
  value: string;
  label: string;
  selected: boolean;
  /** Categories only: their subcategories. */
  subs: { value: string; selected: boolean }[];
};

export type FilterGroup = {
  key: FilterKey;
  label: string;
  /** "Any", or the chosen value (a chosen subcategory wins over its category). */
  current: string;
  active: boolean;
  options: FilterOption[];
};

export type ListingColumn = { key: ListingSortKey; label: string; direction: "asc" | "desc" | null };

export type ListingRow = {
  listing: HostListing;
  selected: boolean;
  price: string;
  actions: { action: ListingRowAction; label: string; danger: boolean }[];
};

export type DeleteDialog = { kind: "blocked"; title: string; upcoming: number } | { kind: "ok"; title: string; rating: string | null };

export type HostListingsViewModel = {
  header: HostPageHeader;
  /** A host with no listings at all. */
  isEmpty: boolean;
  newListingHref: string;
  query: string;
  onQuery: (query: string) => void;
  resultLine: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  groups: FilterGroup[];
  onPick: (key: FilterKey, value: string, subcategory?: string) => void;
  columns: ListingColumn[];
  onSort: (key: ListingSortKey) => void;
  rows: ListingRow[];
  /** Filters took everything away. */
  noMatches: boolean;
  onShowEverything: () => void;
  selection: {
    count: number;
    label: string;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleRow: (id: string) => void;
    onClear: () => void;
    onBulk: (action: BulkAction) => void;
  };
  onRowAction: (listing: HostListing, action: ListingRowAction) => void;
  dialog: DeleteDialog | null;
  onCloseDialog: () => void;
  /** "Hide it instead", "Archive it instead" or the delete itself. */
  onDialogConfirm: () => void;
};

const COLUMNS: { key: ListingSortKey; label: string }[] = [
  { key: "title", label: "Listing" },
  { key: "cat", label: "Category" },
  { key: "status", label: "Status" },
  { key: "price", label: "Price" },
  { key: "next", label: "Next date" },
  { key: "bookings", label: "Booked" },
  { key: "rating", label: "Rating" },
];

// Nothing is saved to itin from here yet: these stay as the design draws them
// (the menu closes, the selection clears) and say so.
const NOT_CONNECTED = "This will work once your listings are connected.";

export function useHostListingsViewModel(): HostListingsViewModel {
  const router = useRouter();
  const preview = useSearchParams().get("preview");
  const listings = useHostListings(preview);

  const [filters, setFilters] = useState<ListingFilters>(NO_FILTERS);
  const [sortKey, setSortKey] = useState<ListingSortKey>("next");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialog, setDialog] = useState<DeleteDialog | null>(null);

  const newListingHref = `${HOST_PORTAL_BASE}/listings/new`;
  const shown = sortListings(filterListings(listings, filters), sortKey, sortDir);
  const visibleSelected = selected.filter((id) => shown.some((l) => l.id === id));
  const allSelected = shown.length > 0 && visibleSelected.length === shown.length;

  // Changing what's shown starts a fresh selection.
  const change = (next: Partial<ListingFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
    setSelected([]);
  };

  const groups: FilterGroup[] = [
    {
      key: "status",
      label: "Status",
      current: filters.status === "All" ? "Any" : filters.status,
      active: filters.status !== "All",
      options: STATUS_OPTIONS.map((s) => ({ value: s, label: s, selected: filters.status === s, subs: [] })),
    },
    {
      key: "category",
      label: "Category",
      current: filters.subcategory !== "All" ? filters.subcategory : filters.category === "All" ? "Any" : filters.category,
      active: filters.category !== "All" || filters.subcategory !== "All",
      options: Object.entries(CATEGORY_TREE).map(([category, subs]) => ({
        value: category,
        label: category,
        selected: filters.category === category && filters.subcategory === "All",
        subs: subs.map((s) => ({ value: s, selected: filters.category === category && filters.subcategory === s })),
      })),
    },
    {
      key: "rating",
      label: "Rating",
      current: filters.rating === "All" ? "Any" : filters.rating,
      active: filters.rating !== "All",
      options: RATING_OPTIONS.filter((r) => r !== "All").map((r) => ({ value: r, label: r, selected: filters.rating === r, subs: [] })),
    },
  ];

  const onPick = (key: FilterKey, value: string, subcategory?: string) => {
    if (key === "status") change({ status: value as ListingFilters["status"] });
    else if (key === "rating") change({ rating: value as ListingFilters["rating"] });
    else change({ category: value, subcategory: subcategory ?? "All" });
  };

  const onRowAction = (listing: HostListing, action: ListingRowAction) => {
    switch (action) {
      case "edit":
        router.push(newListingHref);
        return;
      case "preview":
        window.open(`/experiences/${listing.id}`, "_blank", "noopener");
        return;
      case "copy-link":
        void navigator.clipboard
          ?.writeText(`${window.location.origin}/experiences/${listing.id}`)
          .then(() => toast.success("Link copied"))
          .catch(() => toast.error("Couldn't copy the link"));
        return;
      case "delete":
        setDialog(
          listing.future > 0
            ? { kind: "blocked", title: listing.title, upcoming: listing.future }
            : { kind: "ok", title: listing.title, rating: listing.rating === "-" ? null : listing.rating },
        );
        return;
      default:
        toast.info(NOT_CONNECTED);
    }
  };

  return {
    header: {
      title: "Your listings",
      subtitle: listingsSummary(listings),
      actions: [{ label: "Start a new listing", href: newListingHref, primary: true }],
    },
    isEmpty: listings.length === 0,
    newListingHref,
    query: filters.q,
    onQuery: (q) => change({ q }),
    resultLine: resultLine(shown.length, listings.length),
    hasFilters: hasActiveFilters(filters),
    onClearFilters: () => change(NO_FILTERS),
    groups,
    onPick,
    columns: COLUMNS.map((c) => ({ ...c, direction: sortKey === c.key ? (sortDir === 1 ? "asc" : "desc") : null })),
    onSort: (key) => {
      setSortDir(key === sortKey ? (sortDir === 1 ? -1 : 1) : 1);
      setSortKey(key);
    },
    rows: shown.map((listing) => ({
      listing,
      selected: selected.includes(listing.id),
      price: priceLabel(listing.price),
      actions: rowActions(listing),
    })),
    noMatches: listings.length > 0 && shown.length === 0,
    onShowEverything: () => change(NO_FILTERS),
    selection: {
      count: visibleSelected.length,
      label: `${visibleSelected.length} ${visibleSelected.length === 1 ? "listing" : "listings"} selected`,
      allSelected,
      onToggleAll: () => setSelected(allSelected ? [] : shown.map((l) => l.id)),
      onToggleRow: (id) => setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id])),
      onClear: () => setSelected([]),
      onBulk: () => {
        toast.info(NOT_CONNECTED);
        setSelected([]);
      },
    },
    onRowAction,
    dialog,
    onCloseDialog: () => setDialog(null),
    onDialogConfirm: () => {
      toast.info(NOT_CONNECTED);
      setDialog(null);
    },
  };
}
