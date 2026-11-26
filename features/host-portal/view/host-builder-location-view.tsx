import { Check, CircleX, Search } from "lucide-react";

import { cn } from "@/lib/utils";

import type { HostListingBuilderViewModel } from "../view-model/use-host-listing-builder-view-model";
import { inputClass } from "./host-builder-parts";

// The location step's picker: a search whose results can be picked several at a
// time, the locations picked as chips, and popular places to pick without searching.
export function LocationPicker({ place }: { place: HostListingBuilderViewModel["place"] }) {
  return (
    <div className="mb-[22px]">
      <div className="mb-1.5 text-base font-medium text-[#333134]">Locations</div>
      <div
        className="relative"
        // Close the results once focus leaves the search and its list, not when it moves between them.
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) place.onClose();
        }}
      >
        <Search className="pointer-events-none absolute top-[15px] left-3.5 size-[18px] text-[#6F6B72]" />
        <input
          aria-label="Locations"
          value={place.query}
          placeholder="Search for locations"
          onChange={(e) => place.onQuery(e.target.value)}
          onFocus={place.onOpen}
          className={`${inputClass} pl-[42px]`}
        />
        {place.open && (
          <div
            role="listbox"
            aria-label="Search results"
            aria-multiselectable="true"
            // Keep the search focused while picking, so the list stays open for more.
            onMouseDown={(e) => e.preventDefault()}
            className="absolute inset-x-0 top-[54px] z-30 flex flex-col rounded-[14px] bg-white p-1.5 shadow-[inset_0_0_0_1px_#E7E7E7,0_12px_32px_rgba(16,24,40,0.14)]"
          >
            {place.results.map((r) => (
              <button
                key={`${r.name},${r.lat},${r.lng}`}
                type="button"
                role="option"
                aria-selected={r.picked}
                onClick={() => place.onToggle(r)}
                className="flex w-full cursor-pointer items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[#F5F5F5]"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-px flex size-[17px] shrink-0 items-center justify-center rounded-[5px]",
                    r.picked ? "bg-[#F5032D] text-white" : "bg-white shadow-[inset_0_0_0_1.5px_#D2D2D2]",
                  )}
                >
                  {r.picked && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span>
                  <span className="block text-[13.5px] font-medium">{r.name}</span>
                  <span className="mt-px block text-xs text-[#6F6B72]">{r.area}</span>
                </span>
              </button>
            ))}
            {place.noMatch && (
              <div>
                <p className="p-2.5 text-[13px] leading-normal text-[#6F6B72]">
                  Nothing by that name. Try a nearby place we can pin on the map, or add your words as they are.
                </p>
                <button
                  type="button"
                  onClick={place.onUseTyped}
                  className="h-9 w-full cursor-pointer rounded-[9px] bg-[#F4F2EE] px-2.5 text-left text-[12.5px] font-medium"
                >
                  Use &ldquo;{place.query}&rdquo; anyway
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-1.5 text-xs text-[#6F6B72]">Search by landmark, city or area.</div>

      {place.selected.length > 0 && (
        <ul aria-label="Your locations" className="mt-3 flex flex-wrap gap-2">
          {place.selected.map((l) => (
            <li key={l.key} className="flex min-h-9 items-center gap-2 rounded-full bg-[#F4F2EE] py-1 pr-1.5 pl-3.5 text-[13.5px] text-[#333134]">
              <span>{l.name}</span>
              {!l.pinned && <span className="text-xs text-[#B4760A]">not on the map</span>}
              <button
                type="button"
                aria-label={`Remove ${l.name}`}
                onClick={l.onRemove}
                className="flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-[#E9E1D2]"
              >
                <CircleX className="size-[17px]" strokeWidth={1.8} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {place.needsPin && (
        <div className="mt-2 text-xs text-[#B4760A]">None of these are on the map yet. Search again and pick at least one from the list.</div>
      )}

      {place.suggestions.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-[11px] font-medium tracking-[0.06em] text-[#6F6B72] uppercase">Suggestions</div>
          <div role="group" aria-label="Suggestions" className="flex flex-wrap gap-2">
            {place.suggestions.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={s.onPick}
                className="flex min-h-8 cursor-pointer items-center rounded-full bg-white px-3 py-1 text-[12.5px] font-medium text-[#333134] shadow-[inset_0_0_0_1px_#E0DFDD] hover:bg-[#F4F2EE]"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
