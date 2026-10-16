"use client";

import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { HostEarningsViewModel } from "../view-model/use-host-earnings-view-model";
import { StatusChip } from "./host-booking-parts";
import { MENU } from "./host-filter-dropdown-view";

const CARD = "rounded-2xl bg-white shadow-[inset_0_0_0_1px_#E7E7E7]";

function RangeMenu({ vm }: { vm: HostEarningsViewModel }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Range: ${vm.range}`}
        className={cn(
          "flex h-9 cursor-pointer items-center gap-2 rounded-full bg-white px-[13px] text-[12.5px] whitespace-nowrap text-[#333134] hover:bg-[#FAF9F7]",
          open ? "shadow-[inset_0_0_0_1.5px_#2C0101]" : "shadow-[inset_0_0_0_1px_#E7E7E7]",
        )}
      >
        <svg aria-hidden width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-[#6F6B72]">
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
          <path d="M8 3v4M16 3v4M3.5 10h17" />
        </svg>
        <span className="font-medium">{vm.range}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 text-[#6F6B72] transition-transform", open && "rotate-180")} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={6} className="z-40">
          <Popover.Popup className={cn(MENU, "flex w-[200px] flex-col")}>
            {vm.ranges.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  vm.onRange(r.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-[34px] cursor-pointer items-center gap-[9px] rounded-[9px] px-[9px] text-left text-[13px] text-[#333134] hover:bg-[#F5F5F5]",
                  r.selected ? "font-medium" : "font-normal",
                )}
              >
                <Check aria-hidden className={cn("size-[13px] shrink-0", r.selected ? "text-[#F5032D]" : "text-transparent")} strokeWidth={2.6} />
                <span>{r.value}</span>
              </button>
            ))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Handoff "Listing Builder" prototype, Earnings: the headline numbers, and every
// booking with what we took and what the host receives.
export function HostEarningsView({ vm }: { vm: HostEarningsViewModel }) {
  if (!vm.ready) return <div className="flex-1 bg-[#FCFCFC]" />;

  return (
    <div className="flex-1 overflow-y-auto bg-[#FCFCFC] px-7 pt-5 pb-[90px]">
      <div className="mb-[18px] flex items-center gap-3">
        <span className="text-[12.5px] text-[#6F6B72]">{vm.rangeLabel}</span>
        <div className="ml-auto">
          <RangeMenu vm={vm} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3.5 xl:grid-cols-4">
        {vm.stats.map((stat) => (
          <div key={stat.label} className={cn(CARD, "px-[18px] py-4")}>
            <p className="text-[12.5px] text-[#6F6B72]">{stat.label}</p>
            <p className="mt-2 font-heading text-2xl leading-[1.2] font-extrabold text-[#333134]">{stat.value}</p>
            <p className="mt-1.5 text-xs text-[#6F6B72]">{stat.note}</p>
          </div>
        ))}
      </div>

      <section className={cn(CARD, "overflow-hidden")}>
        <div className="flex items-center gap-2.5 px-[18px] py-[15px] shadow-[inset_0_-1px_0_#E7E7E7]">
          <h2 className="text-sm font-medium text-[#333134]">Every booking, and what we took</h2>
          <button
            type="button"
            onClick={vm.onDownload}
            className="ml-auto h-[34px] cursor-pointer rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7]"
          >
            Download a statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <div role="table" aria-label="Earnings" className="min-w-[900px]">
            <div role="row" className="flex h-[38px] items-center gap-3.5 px-[18px] text-[11.5px] font-medium text-[#6F6B72] shadow-[inset_0_-1px_0_#F0F0F0]">
              <span role="columnheader" className="w-[104px] shrink-0">Reference</span>
              <span role="columnheader" className="min-w-0 flex-1">Listing and guest</span>
              <span role="columnheader" className="w-24 shrink-0">Date</span>
              <span role="columnheader" className="w-[104px] shrink-0 text-right">Guests paid</span>
              <span role="columnheader" className="w-28 shrink-0 text-right">{vm.commissionHeading}</span>
              <span role="columnheader" className="w-[104px] shrink-0 text-right">You receive</span>
              <span role="columnheader" className="w-[92px] shrink-0">Status</span>
            </div>

            {vm.rows.map((row) => (
              <div key={row.ref} role="row" className="px-[18px] py-[13px] shadow-[inset_0_-1px_0_#F0F0F0]">
                <div className="flex items-center gap-3.5">
                  <span className="w-[104px] shrink-0 text-[12.5px] text-[#6F6B72]">{row.ref}</span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-[#333134]">{row.what}</span>
                  <span className="w-24 shrink-0 text-[12.5px] text-[#6F6B72]">{row.date}</span>
                  <span className="w-[104px] shrink-0 text-right text-[13px] text-[#333134]">{row.gross}</span>
                  <span className="w-28 shrink-0 text-right text-[13px] text-[#6F6B72]">{row.commission}</span>
                  <span className="w-[104px] shrink-0 text-right text-[13px] font-medium text-[#333134]">{row.net}</span>
                  <span className="w-[92px] shrink-0">
                    <StatusChip status={row.status === "Cleared" ? "Live" : "In review"} label={row.status} />
                  </span>
                </div>
                <p className="mt-[5px] text-xs text-[#A09DA3]">{row.plain}</p>
              </div>
            ))}

            {vm.none && <p className="px-6 py-14 text-center text-[13.5px] text-[#6F6B72]">{vm.noneMessage}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
