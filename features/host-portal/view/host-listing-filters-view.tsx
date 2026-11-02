"use client";

import { Search } from "lucide-react";


import type { HostListingsViewModel } from "../view-model/use-host-listings-view-model";
import { FilterDropdown } from "./host-filter-dropdown-view";

export function Toolbar({ vm }: { vm: HostListingsViewModel }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <Search aria-hidden className="absolute top-[10px] left-3 size-4 text-[#6F6B72]" strokeWidth={1.8} />
        <input
          type="search"
          value={vm.query}
          onChange={(e) => vm.onQuery(e.target.value)}
          placeholder="Search your listings"
          aria-label="Search your listings"
          className="h-9 w-[280px] rounded-full bg-white pr-3 pl-[34px] text-[13px] text-[#333134] shadow-[inset_0_0_0_1px_#E7E7E7] outline-none placeholder:text-[#6F6B72] focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <span className="text-[12.5px] text-[#6F6B72]">{vm.resultLine}</span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {vm.hasFilters && (
          <button type="button" onClick={vm.onClearFilters} className="h-8 cursor-pointer rounded-full px-[13px] text-[12.5px] font-medium text-[#F5032D]">
            Clear filters
          </button>
        )}
        {vm.groups.map((group) => (
          <FilterDropdown key={group.key} group={group} onPick={vm.onPick} />
        ))}
      </div>
    </div>
  );
}

export function BulkBar({ vm }: { vm: HostListingsViewModel }) {
  const { selection } = vm;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-full bg-[#2C0101] py-2 pr-2 pl-4 text-white">
      <span className="text-[13px] font-medium">{selection.label}</span>
      {(
        [
          ["Hide from search", "hide"],
          ["Pause new bookings", "pause"],
          ["Archive", "archive"],
        ] as const
      ).map(([label, action]) => (
        <button
          key={action}
          type="button"
          onClick={() => selection.onBulk(action)}
          className="h-8 cursor-pointer rounded-full bg-white/[0.14] px-[13px] text-[12.5px] font-medium text-white hover:bg-white/[0.24]"
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        onClick={selection.onClear}
        className="ml-auto h-8 cursor-pointer rounded-full bg-white px-3.5 text-[12.5px] font-medium text-[#2C0101]"
      >
        Clear
      </button>
    </div>
  );
}

