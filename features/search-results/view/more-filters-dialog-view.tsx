"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { CalendarDays, Coins, Heart, Moon, Sparkles, Ticket, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { FeaturedId, PanelBlock, PanelGroup } from "../model/search-results.types";
import type { SearchResultsViewModel } from "../view-model/use-search-results-view-model";
import { CategoryIcon } from "./category-icons";
import { OptionChip, PriceRangeControl, Stepper, ToggleRow } from "./filter-controls-view";

export type MoreFiltersDialogViewProps = SearchResultsViewModel;

const FEATURED_ICONS: Record<FeaturedId, ReactNode> = {
  pickedForYou: <Heart className="size-5" />,
  tonight: <Moon className="size-5" />,
  weekend: <CalendarDays className="size-5" />,
  free: <Ticket className="size-5" />,
  under15k: <Coins className="size-5" />,
};

function Section({ title, children, last = false }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={cn("flex flex-col gap-5 py-7", !last && "border-b border-[#e0dfdd]")}>
      <h3 className="font-sans text-xl font-semibold leading-[30px] text-[#1f1c20]">{title}</h3>
      {children}
    </section>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <p className="font-sans text-base font-medium leading-6 text-[#1f1c20]">{children}</p>;
}

function Chips({ group, onToggle }: { group: PanelGroup; onToggle: (groupId: string, value: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <SubHeading>{group.label}</SubHeading>
      <div className="flex flex-wrap gap-2">
        {group.options.map((o) => (
          <OptionChip key={o.value} selected={o.selected} disabled={o.disabled} onClick={() => onToggle(group.id, o.value)}>
            {o.label}
          </OptionChip>
        ))}
      </div>
    </div>
  );
}

export function MoreFiltersDialogView(vm: MoreFiltersDialogViewProps) {
  const { panelOpen, closePanel, panel, filters, total, isLoading, footerLabel } = vm;

  useEffect(() => {
    if (!panelOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel]);

  if (!panelOpen) return null;

  const noResults = !isLoading && total === 0;
  const featuredAction: Record<FeaturedId, () => void> = {
    pickedForYou: vm.togglePickedForYou,
    tonight: vm.pickTonight,
    weekend: vm.pickThisWeekend,
    free: vm.toggleFree,
    under15k: vm.toggleUnder15k,
  };

  function renderBlock(block: PanelBlock, index: number) {
    if (block.kind === "group") return <Chips key={block.group.id} group={block.group} onToggle={vm.toggleOption} />;
    if (block.kind === "stepper") {
      return (
        <div key={block.id} className="flex flex-col gap-3">
          <SubHeading>{block.label}</SubHeading>
          <Stepper label={block.label} value={block.value} onChange={vm.setGroupSize} />
        </div>
      );
    }
    return (
      <div key={`flags-${index}`} className="flex flex-col">
        {block.items.map((item) => (
          <ToggleRow key={item.id} label={item.label} on={item.on} onChange={(on) => vm.setFlag(item.id, on)} />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center md:p-5">
      <div aria-hidden onClick={closePanel} className="absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="relative flex max-h-full w-full flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_12px_48px_rgba(0,0,0,0.2)] max-md:h-[90vh] md:h-[860px] md:max-h-[calc(100vh-40px)] md:w-[750px] md:rounded-[24px]"
      >
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-[#e0dfdd]">
          <h2 className="font-sans text-base font-semibold text-[#1f1c20]">Filters</h2>
          <button
            type="button"
            aria-label="Close filters"
            onClick={closePanel}
            className="absolute right-2.5 top-2.5 flex size-11 items-center justify-center rounded-full transition-colors hover:bg-[#f4f2ee] cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <Section title="Type">
            <div className="flex flex-wrap gap-2">
              {panel.types.map((t) => (
                <OptionChip
                  key={t.value}
                  selected={t.selected}
                  onClick={() => vm.toggleType(t.value)}
                  icon={t.value === "events" ? <Ticket className="size-5" /> : undefined}
                >
                  {t.label}
                </OptionChip>
              ))}
            </div>
            <p className="font-sans text-sm text-[#6f6b72]">
              {vm.clearedNote
                ? `Cleared ${vm.clearedNote} ${vm.clearedNote === 1 ? "filter" : "filters"} that ${vm.clearedNote === 1 ? "doesn't" : "don't"} apply`
                : "Choose one to see more filters."}
            </p>
          </Section>

          <Section title="Featured">
            <div className="flex flex-wrap gap-2">
              {panel.featured.map((f) => (
                <OptionChip key={f.id} selected={f.selected} onClick={featuredAction[f.id]} icon={FEATURED_ICONS[f.id]}>
                  {f.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Category">
            {panel.categoryGroups.map((group) => (
              <div key={group.title ?? "single"} className="flex flex-col gap-3">
                {group.title && <SubHeading>{group.title}</SubHeading>}
                <div className="flex flex-wrap gap-2">
                  {group.items.map((c) => (
                    <OptionChip
                      key={c.slug}
                      selected={c.selected}
                      onClick={() => vm.toggleCategory(c.slug)}
                      icon={<CategoryIcon slug={c.slug} kind={c.kind} />}
                    >
                      {c.label}
                    </OptionChip>
                  ))}
                </div>
              </div>
            ))}

            {panel.subcategories && (
              <div className="flex flex-wrap gap-2">
                {panel.subcategories.map((s) => (
                  <OptionChip key={s.slug} selected={s.selected} onClick={() => vm.toggleSubcategory(s.slug)}>
                    {s.label}
                  </OptionChip>
                ))}
              </div>
            )}

            {panel.showQuizPrompt && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#f4f2ee] px-4 py-3.5">
                <Sparkles className="size-5 shrink-0" />
                <p className="flex-1 font-sans text-sm text-[#1f1c20]">
                  Want to narrow it down further? Take the taste quiz and we&apos;ll show more filters.
                </p>
                <Link href={vm.quizHref} className="shrink-0 font-sans text-sm font-semibold text-[#1f1c20] hover:underline">
                  Make it mine
                </Link>
              </div>
            )}
          </Section>

          <Section title="Price">
            <PriceRangeControl
              price={filters.price}
              ceiling={vm.priceCeiling}
              quickRanges={vm.priceQuickRanges}
              onChange={vm.setPrice}
            />
            <p className="font-sans text-sm text-[#6f6b72]">Per person or per ticket. Prices include all fees and taxes.</p>
            <ToggleRow label="Free" on={filters.free} onChange={vm.toggleFree} />
          </Section>

          <Section title="Collections">
            <div className="flex flex-wrap gap-2">
              {panel.collections.options.map((o) => (
                <OptionChip
                  key={o.value}
                  selected={o.selected}
                  disabled={o.disabled}
                  onClick={() => vm.toggleOption(panel.collections.id, o.value)}
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Place">
            {panel.place.map((g) => (
              <Chips key={g.id} group={g} onToggle={vm.toggleOption} />
            ))}
          </Section>

          <Section title="Time of day">
            <div className="flex flex-wrap gap-2">
              {panel.timeOfDay.options.map((o) => (
                <OptionChip key={o.value} selected={o.selected} onClick={() => vm.toggleOption("timeOfDay", o.value)}>
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Section>

          <Section title="Who it suits" last={!panel.typeSection}>
            {panel.whoItSuits.map((g) => (
              <Chips key={g.id} group={g} onToggle={vm.toggleOption} />
            ))}
          </Section>

          {panel.typeSection ? (
            <Section title={panel.typeSection.title} last>
              {panel.typeSection.blocks.map(renderBlock)}
            </Section>
          ) : (
            <p className="pb-6 font-sans text-sm text-[#6f6b72]">
              Want more filters? Choose{" "}
              <button type="button" onClick={() => vm.toggleType("experiences")} className="font-medium text-[#1f1c20] hover:underline cursor-pointer">
                Experiences
              </button>{" "}
              or{" "}
              <button type="button" onClick={() => vm.toggleType("events")} className="font-medium text-[#1f1c20] hover:underline cursor-pointer">
                Events
              </button>{" "}
              above.
            </p>
          )}
        </div>

        <div className="flex h-[76px] shrink-0 items-center justify-between border-t border-[#e0dfdd] bg-white px-6">
          <button
            type="button"
            disabled={!vm.hasActiveFilters}
            onClick={vm.clearAll}
            className="font-sans text-base font-medium text-[#1f1c20] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-[#b9b5ae] disabled:no-underline cursor-pointer"
          >
            Clear all
          </button>
          <button
            type="button"
            disabled={noResults}
            onClick={closePanel}
            className="h-12 rounded-full bg-brand px-6 font-sans text-base font-semibold text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-[#d9d5cf] cursor-pointer"
          >
            {noResults ? "No matching experiences" : footerLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
