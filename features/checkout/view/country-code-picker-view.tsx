"use client";

import { Drawer } from "@base-ui/react/drawer";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

import type { Country } from "../model/country.types";

const DESKTOP_QUERY = "(min-width: 1024px)";

const canMatchMedia = () => typeof window.matchMedia === "function";

const subscribeToViewport = (onChange: () => void) => {
  if (!canMatchMedia()) return () => {};
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** Wide screens get a dropdown under the field; phones get a bottom sheet. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToViewport,
    () => !canMatchMedia() || window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}

const matches = (country: Country, query: string) => {
  const q = query.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return true;
  return country.name.toLowerCase().includes(q) || country.dial.startsWith(q);
};

// "+234 Nigeria"
const label = (country: Country) => `+${country.dial} ${country.name}`;

function CountryList({
  options,
  selected,
  onPick,
}: {
  options: Country[];
  selected: Country;
  onPick: (country: Country) => void;
}) {
  const [query, setQuery] = useState("");
  const shown = options.filter((country) => matches(country, query));

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#6F6B72]" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search country or code"
          aria-label="Search country or code"
          className="h-12 w-full rounded-full bg-[#F4F2EE] pr-4 pl-11 font-sans text-base font-medium text-[#333134] outline-none placeholder:text-[#BDBDBD] focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <ul role="listbox" aria-label="Country code" className="-mx-2 flex min-h-0 flex-col overflow-y-auto overscroll-contain">
        {shown.map((country) => {
          const active = country.iso === selected.iso;
          return (
            <li key={country.iso} role="option" aria-selected={active}>
              <button
                type="button"
                onClick={() => onPick(country)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left font-sans text-base text-[#333134] hover:bg-[#F4F2EE]",
                  active && "bg-[#F4F2EE] font-medium",
                )}
              >
                <span>{label(country)}</span>
                {active && <Check className="size-5 shrink-0 text-[#F5032D]" />}
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-3 py-6 text-center font-sans text-sm text-[#6F6B72]">No countries found</li>}
      </ul>
    </div>
  );
}

// Country code field for the phone number: a pill showing "+234", opening a
// searchable list of "+234 Nigeria" rows. A dropdown on desktop, a bottom
// sheet on mobile.
export function CountryCodePickerView({
  selected,
  options,
  onSelect,
  disabled = false,
}: {
  selected: Country;
  options: Country[];
  onSelect: (country: Country) => void;
  disabled?: boolean;
}) {
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(false);

  const pick = (country: Country) => {
    onSelect(country);
    setOpen(false);
  };
  const triggerClass =
    "flex h-12 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-muted px-3 font-sans text-base font-medium text-[#333134] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-60";
  const trigger = (
    <>
      +{selected.dial}
      <ChevronDown aria-hidden className="size-5 text-[#6F6B72]" />
    </>
  );

  if (desktop) {
    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger aria-label={`Country code, ${label(selected)}`} disabled={disabled} className={triggerClass}>
          {trigger}
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
            <Popover.Popup className="flex max-h-[360px] w-[320px] flex-col rounded-lg border border-[#E7E7E7] bg-white p-3 shadow-[0_12px_44px_rgba(0,0,0,0.12)] outline-none">
              <CountryList options={options} selected={selected} onPick={pick} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="down">
      <Drawer.Trigger aria-label={`Country code, ${label(selected)}`} disabled={disabled} className={triggerClass}>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/40 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-end">
          <Drawer.Popup className="flex max-h-[80dvh] w-full flex-col gap-4 rounded-t-2xl bg-white px-4 pt-3 pb-6 outline-none transition-transform duration-300 [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)]">
            <span aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-full bg-[#E0E0E0]" />
            <Drawer.Title className="font-sans text-lg font-semibold text-[#333134]">Select country code</Drawer.Title>
            <CountryList options={options} selected={selected} onPick={pick} />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
