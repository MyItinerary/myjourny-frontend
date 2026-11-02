"use client";

import { LocateFixed, MapPin, Search } from "lucide-react";

import { ModalFooter, ModalShell } from "@/components/account-settings/section-ui";
import { cn } from "@/lib/utils";

import type { ProfileCityViewModel } from "../view-model/use-profile-city-view-model";

/** The "Edit city" dialog: search any city, or fill it from the browser's location. */
export function CityDialogView(vm: ProfileCityViewModel) {
  if (!vm.open) return null;
  return (
    <ModalShell title="Edit city" onClose={vm.onClose}>
      <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border px-4 text-muted-foreground">
        <Search size={20} className="shrink-0" />
        <input
          value={vm.search}
          onChange={(e) => vm.onSearchChange(e.target.value)}
          placeholder="Search for a city"
          aria-label="Search for a city"
          className="h-full flex-1 border-none bg-transparent font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <button
        type="button"
        onClick={vm.onUseMyLocation}
        disabled={vm.locating}
        className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium text-brand underline disabled:cursor-wait"
      >
        <LocateFixed size={16} className="shrink-0" />
        {vm.locating ? "Finding your city…" : "Use my location"}
      </button>
      {vm.notice && (
        <div role="status" className="mt-3 text-sm text-muted-foreground">
          {vm.notice}
        </div>
      )}
      {vm.listLabel && vm.choices.length > 0 && (
        <div className="mt-4 text-sm font-medium text-foreground">{vm.listLabel}</div>
      )}
      <div className="mt-2 flex max-h-70 flex-col gap-0.5 overflow-auto">
        {vm.searching && <div className="px-3.5 py-5 text-sm text-muted-foreground">Searching…</div>}
        {!vm.searching &&
          vm.choices.map((choice) => {
            const selected = vm.selectedKey === choice.key;
            return (
              <button
                key={choice.key}
                type="button"
                aria-pressed={selected}
                onClick={() => vm.onSelect(choice)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 py-3 text-left hover:bg-[#F5F5F5]",
                  selected ? "bg-muted" : "bg-transparent",
                )}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="shrink-0 text-foreground" />
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{choice.name}</div>
                    {choice.detail && <div className="text-[13px] text-muted-foreground">{choice.detail}</div>}
                  </div>
                </div>
                {selected && <div className="shrink-0 text-[13px] font-medium text-brand">Selected</div>}
              </button>
            );
          })}
      </div>
      <ModalFooter
        onCancel={vm.onClose}
        saveLabel={vm.saving ? "Saving…" : "Save"}
        saveDisabled={!vm.canSave}
        onSave={vm.onSave}
      />
    </ModalShell>
  );
}
