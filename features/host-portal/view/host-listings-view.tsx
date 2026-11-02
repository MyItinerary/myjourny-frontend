"use client";

import { Popover } from "@base-ui/react/popover";
import { Check, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { DeleteDialogView } from "./host-listing-delete-dialog-view";
import { MENU } from "./host-filter-dropdown-view";
import { BulkBar, Toolbar } from "./host-listing-filters-view";

import { cn } from "@/lib/utils";

import type { ListingStatus } from "../model/home.types";
import type { HostListingsViewModel, ListingColumn, ListingRow } from "../view-model/use-host-listings-view-model";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";

const CHIP: Record<ListingStatus, string> = {
  Live: "text-[#0CBA65] bg-[#F0FCF5]",
  Draft: "text-[#6F6B72] bg-[#F5F5F5]",
  "In review": "text-[#B4760A] bg-[#FDF7EB]",
  Hidden: "text-[#6F6B72] bg-[#F5F5F5]",
  Paused: "text-[#B4760A] bg-[#FDF7EB]",
  "Sold out": "text-[#3086FF] bg-[#F0F6FF]",
  Archived: "text-[#6F6B72] bg-[#F5F5F5]",
  Rejected: "text-[#F5032D] bg-[#FEF2F3]",
};

// Column widths, shared by the header and every row so they line up.
const COL_WIDTH: Record<ListingColumn["key"], string> = {
  title: "min-w-[220px] flex-1",
  cat: "w-[132px] shrink-0",
  status: "w-24 shrink-0",
  price: "w-[88px] shrink-0",
  next: "w-28 shrink-0",
  bookings: "w-[78px] shrink-0",
  rating: "w-16 shrink-0",
};

function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "flex size-[17px] shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-white",
        checked ? "bg-[#F5032D] shadow-[inset_0_0_0_1.5px_#F5032D]" : "bg-white shadow-[inset_0_0_0_1.5px_#D9D9D9]",
      )}
    >
      {checked && <Check aria-hidden className="size-[11px]" strokeWidth={3} />}
    </button>
  );
}

function RowMenu({ row, onAction }: { row: ListingRow; onAction: HostListingsViewModel["onRowAction"] }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Actions for ${row.listing.title}`}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full text-[#6F6B72] hover:bg-[#F0F0F0]"
      >
        <MoreVertical aria-hidden className="size-4" strokeWidth={2.2} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={4} className="z-40">
          <Popover.Popup className={cn(MENU, "flex w-[196px] flex-col")}>
            {row.actions.map((item) => (
              <button
                key={item.action}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAction(row.listing, item.action);
                }}
                className={cn(
                  "h-[34px] cursor-pointer rounded-[9px] px-2.5 text-left text-[13px] hover:bg-[#F5F5F5]",
                  item.danger ? "mt-1 border-t border-[#F0F0F0] pt-1 text-[#F5032D]" : "text-[#333134]",
                )}
              >
                {item.label}
              </button>
            ))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Table({ vm }: { vm: HostListingsViewModel }) {
  const { selection } = vm;
  return (
    <div className={cn(CARD, "overflow-x-auto")}>
      <div role="table" aria-label="Your listings" className="min-w-[1000px]">
        <div role="row" className="flex h-[42px] items-center gap-3.5 px-4 shadow-[inset_0_-1px_0_#E7E7E7]">
          <Checkbox checked={selection.allSelected} label="Select all listings" onChange={selection.onToggleAll} />
          {vm.columns.map((column) => (
            <div
              key={column.key}
              role="columnheader"
              aria-sort={column.direction === "asc" ? "ascending" : column.direction === "desc" ? "descending" : "none"}
              className={COL_WIDTH[column.key]}
            >
              <button
                type="button"
                onClick={() => vm.onSort(column.key)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 text-left text-[11.5px] font-medium",
                  column.direction ? "text-[#333134]" : "text-[#6F6B72]",
                )}
              >
                <span>{column.label}</span>
                {column.direction && <span aria-hidden className="text-[10px] text-[#F5032D]">{column.direction === "asc" ? "↑" : "↓"}</span>}
              </button>
            </div>
          ))}
          <span className="w-8 shrink-0" />
        </div>

        {vm.rows.map((row) => (
          <div
            key={row.listing.id}
            role="row"
            className={cn(
              "flex h-[60px] items-center gap-3.5 px-4 shadow-[inset_0_-1px_0_#F0F0F0] hover:bg-[#FCFCFC]",
              row.selected && "bg-[#FDF7F8] hover:bg-[#FDF7F8]",
            )}
          >
            <Checkbox checked={row.selected} label={`Select ${row.listing.title}`} onChange={() => vm.selection.onToggleRow(row.listing.id)} />
            <Link href={row.href} className={cn(COL_WIDTH.title, "flex items-center gap-[11px]")}>
              <span className="relative h-[34px] w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={row.listing.imageUrl} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-[#333134]">{row.listing.title}</p>
                <p className="mt-px text-[11.5px] text-[#6F6B72]">{row.listing.sub}</p>
              </div>
            </Link>
            <span className={cn(COL_WIDTH.cat, "min-w-0")}>
              <span className="block truncate text-[12.5px] text-[#6F6B72]">{row.listing.cat}</span>
              <span className="mt-px block truncate text-[11.5px] text-[#A09DA3]">{row.listing.subcat}</span>
            </span>
            <span className={COL_WIDTH.status}>
              <span className={cn("inline-block rounded-full px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap", CHIP[row.listing.status])}>
                {row.listing.status}
              </span>
            </span>
            <span className={cn(COL_WIDTH.price, "text-[13px] text-[#333134]")}>{row.price}</span>
            <span className={cn(COL_WIDTH.next, "text-[12.5px] text-[#6F6B72]")}>{row.listing.next}</span>
            <span className={cn(COL_WIDTH.bookings, "text-[13px] text-[#333134]")}>{row.listing.bookings}</span>
            <span className={cn(COL_WIDTH.rating, "text-[13px] text-[#6F6B72]")}>{row.listing.rating}</span>
            <div className="w-8 shrink-0">
              <RowMenu row={row} onAction={vm.onRowAction} />
            </div>
          </div>
        ))}

        {vm.noMatches && (
          <div className="px-6 py-14 text-center">
            <p className="mb-2 font-heading text-lg font-extrabold text-[#333134]">Nothing matches that</p>
            <p className="mb-[18px] text-[13.5px] text-[#6F6B72]">No listing fits those filters right now.</p>
            <button
              type="button"
              onClick={vm.onShowEverything}
              className="h-10 cursor-pointer rounded-full bg-white px-[18px] text-[13px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
            >
              Show everything
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// A host with no listings at all. The prototype only gives this the subtitle
// "Nothing here yet", so this card is a plain, on-brand stand-in for the table.
function EmptyListings({ href }: { href: string }) {
  return (
    <div className={cn(CARD, "px-6 py-16 text-center")}>
      <h2 className="mb-2 font-heading text-lg font-extrabold text-[#333134]">Nothing here yet</h2>
      <p className="mx-auto mb-5 max-w-[420px] text-[13.5px] text-pretty text-[#6F6B72]">
        Your listings will show up here, with their status, price, next date and bookings.
      </p>
      <Link href={href} className="inline-flex h-11 items-center rounded-full bg-[#F5032D] px-5 text-sm font-medium text-white hover:bg-[#FF4540]">
        Start a new listing
      </Link>
    </div>
  );
}

// Handoff "Listing Builder" prototype, Listings: a table of every listing with
// search, filters, sorting, row selection with bulk actions, and a menu per row.
export function HostListingsView({ vm }: { vm: HostListingsViewModel }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-5 pb-[90px]">
      {vm.isEmpty ? (
        <EmptyListings href={vm.newListingHref} />
      ) : (
        <>
          {vm.selection.count > 0 ? <BulkBar vm={vm} /> : <Toolbar vm={vm} />}
          <Table vm={vm} />
          <p className="mt-3.5 text-xs text-[#A09DA3]">Click a column to sort. Tick rows to hide, pause or archive several at once.</p>
        </>
      )}
      <DeleteDialogView dialog={vm.dialog} onClose={vm.onCloseDialog} onConfirm={vm.onDialogConfirm} />
    </div>
  );
}
