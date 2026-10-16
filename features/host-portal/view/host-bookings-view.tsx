import Link from "next/link";

import { cn } from "@/lib/utils";

import type { HostBookingsViewModel } from "../view-model/use-host-bookings-view-model";
import { BookingDetailView } from "./host-booking-detail-view";
import { BookingAvatar, StatusChip } from "./host-booking-parts";
import { FilterDropdown } from "./host-filter-dropdown-view";

const COL = {
  ref: "w-[92px] shrink-0",
  guest: "min-w-[200px] flex-1",
  listing: "w-[168px] shrink-0",
  date: "w-[124px] shrink-0",
  guests: "w-16 shrink-0 text-right",
  gross: "w-24 shrink-0 text-right",
  net: "w-[100px] shrink-0 text-right",
  status: "w-[132px] shrink-0 pl-3.5",
} as const;

function Toolbar({ vm }: { vm: HostBookingsViewModel }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <svg aria-hidden className="absolute top-[10px] left-3 size-4 text-[#6F6B72]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <input
          type="search"
          value={vm.query}
          onChange={(e) => vm.onQuery(e.target.value)}
          placeholder="Guest name or reference, MJ-4471"
          aria-label="Search bookings"
          className="h-9 w-[300px] rounded-full bg-white pr-3 pl-[34px] text-[13px] text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] outline-none placeholder:text-[#6F6B72] focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <span className="text-[12.5px] text-[#6F6B72]">{vm.resultLine}</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {vm.hasFilters && (
          <button type="button" onClick={vm.onClearFilters} className="h-9 cursor-pointer rounded-full px-[13px] text-[12.5px] font-medium text-[#F5032D]">
            Clear filters
          </button>
        )}
        {vm.groups.map((group) => (
          <FilterDropdown key={group.key} group={group} onPick={vm.onPick} />
        ))}
        <Link
          href={vm.scanHref}
          className="flex h-9 items-center gap-[7px] rounded-full bg-[#F5032D] px-[15px] text-[13px] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#FF4540]"
        >
          <svg aria-hidden width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
            <path d="M7.5 12h9" />
          </svg>
          <span>Scan tickets</span>
        </Link>
      </div>
    </div>
  );
}

// Handoff "Listing Builder" prototype, Bookings: every booking in a table with
// search and filters, requests you haven't answered first. Click a row for the
// full booking.
export function HostBookingsView({ vm }: { vm: HostBookingsViewModel }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-5 pb-[90px]">
      <Toolbar vm={vm} />

      <div className="overflow-x-auto rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]">
        <div role="table" aria-label="Bookings" className="min-w-[1000px]">
          <div role="row" className="flex h-[42px] items-center gap-3.5 px-[18px] text-[11.5px] font-medium text-[#6F6B72] shadow-[inset_0_-1px_0_#E7E7E7]">
            <span role="columnheader" className={COL.ref}>Reference</span>
            <span role="columnheader" className={COL.guest}>Guest</span>
            <span role="columnheader" className={COL.listing}>Listing</span>
            <span role="columnheader" className={COL.date}>Date</span>
            <span role="columnheader" className={COL.guests}>Guests</span>
            <span role="columnheader" className={COL.gross}>They pay</span>
            <span role="columnheader" className={COL.net}>You receive</span>
            <span role="columnheader" className={COL.status}>Status</span>
          </div>

          {vm.rows.map(({ booking, chip }) => (
            <button
              key={booking.id}
              type="button"
              role="row"
              onClick={() => vm.onOpen(booking.id)}
              className="flex h-16 w-full cursor-pointer items-center gap-3.5 bg-transparent px-[18px] text-left shadow-[inset_0_-1px_0_#F0F0F0] hover:bg-[#FCFCFC]"
            >
              <span className={cn(COL.ref, "text-[12.5px] text-[#6F6B72]")}>{booking.ref}</span>
              <span className={cn(COL.guest, "flex items-center gap-2.5")}>
                <BookingAvatar name={booking.name} url={booking.avatarUrl} size={32} />
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-medium text-[#333134]">{booking.name}</span>
                  {booking.rowNote && <span className="mt-px block truncate text-[11.5px] text-[#6F6B72]">{booking.rowNote}</span>}
                </span>
              </span>
              <span className={cn(COL.listing, "truncate text-[12.5px] text-[#6F6B72]")}>{booking.listing}</span>
              <span className={cn(COL.date, "text-[12.5px] text-[#333134]")}>{booking.date}</span>
              <span className={cn(COL.guests, "text-[13px] text-[#333134]")}>{booking.guests}</span>
              <span className={cn(COL.gross, "text-[13px] text-[#333134]")}>{booking.gross}</span>
              <span className={cn(COL.net, "text-[13px] font-medium text-[#333134]")}>{booking.net}</span>
              <span className={cn(COL.status, "flex items-center")}>
                <StatusChip status={chip} label={booking.status} />
              </span>
            </button>
          ))}

          {vm.none && (
            <div className="px-6 py-[54px] text-center">
              <p className="mb-2 font-heading text-lg font-extrabold text-[#333134]">No bookings here</p>
              <p className="mx-auto mb-[18px] max-w-[420px] text-[13.5px] leading-[1.6] text-[#6F6B72]">
                Nothing matches what you have filtered to. When someone books, they land in this table and you get a WhatsApp the same minute.
              </p>
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
      <p className="mt-3.5 text-xs text-[#A09DA3]">Click any row for the full booking. Requests you have not answered sit at the top.</p>

      <BookingDetailView vm={vm} />
    </div>
  );
}
