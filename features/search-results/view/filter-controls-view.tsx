"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { PriceRange } from "../model/search-results.types";

const STEP = 1_000;

/** A selectable option: 2px ink border and a light fill when selected. */
export function OptionChip({
  selected,
  disabled = false,
  onClick,
  icon,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 font-sans text-[14px] font-medium leading-[21px] whitespace-nowrap transition-all duration-200 ease-out cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f1c20] focus-visible:ring-offset-2 active:scale-[0.97]",
        // One selected state: dark ink.
        selected
          ? "border border-[#1f1c20] bg-[#1f1c20] text-white hover:bg-[#383438]"
          : "border border-[#d9d5cf] bg-white text-[#1f1c20] hover:bg-[#f7f5f2]",
        disabled && "cursor-not-allowed text-[#b9b5ae] hover:bg-white active:scale-100",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function parseAmount(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

export interface PriceRangeControlProps {
  price: PriceRange;
  ceiling: number;
  quickRanges: { label: string; min: number | null; max: number | null }[];
  onChange: (price: PriceRange) => void;
}

export function PriceRangeControl({ price, ceiling, quickRanges, onChange }: PriceRangeControlProps) {
  const low = price.min ?? 0;
  const high = price.max ?? ceiling;
  // Dragging to either end of the track means "no limit" there.
  const commit = (nextLow: number, nextHigh: number) =>
    onChange({ min: nextLow <= 0 ? null : nextLow, max: nextHigh >= ceiling ? null : nextHigh });

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#d9d5cf]" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `${(low / ceiling) * 100}%`, right: `${100 - (high / ceiling) * 100}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={0}
          max={ceiling}
          step={STEP}
          value={low}
          onChange={(e) => commit(Math.min(Number(e.target.value), high - STEP), high)}
          className="price-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={0}
          max={ceiling}
          step={STEP}
          value={high}
          onChange={(e) => commit(low, Math.max(Number(e.target.value), low + STEP))}
          className="price-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex min-w-0 flex-1 flex-col rounded-[12px] border border-[#d9d5cf] px-3.5 py-2">
          <span className="text-xs text-[#6f6b72]">Minimum</span>
          <span className="flex items-center gap-1 text-base font-medium text-[#1f1c20]">
            ₦
            <input
              inputMode="numeric"
              aria-label="Minimum price amount"
              value={price.min == null ? "0" : price.min.toLocaleString("en-NG")}
              onChange={(e) => onChange({ ...price, min: parseAmount(e.target.value) || null })}
              className="w-full min-w-0 bg-transparent outline-none"
            />
          </span>
        </label>
        <span className="text-sm text-[#6f6b72]">to</span>
        <label className="flex min-w-0 flex-1 flex-col rounded-[12px] border border-[#d9d5cf] px-3.5 py-2">
          <span className="text-xs text-[#6f6b72]">Maximum</span>
          <span className="flex items-center gap-1 text-base font-medium text-[#1f1c20]">
            ₦
            <input
              inputMode="numeric"
              aria-label="Maximum price amount"
              value={price.max == null ? `${ceiling.toLocaleString("en-NG")}+` : price.max.toLocaleString("en-NG")}
              onChange={(e) => onChange({ ...price, max: parseAmount(e.target.value) })}
              className="w-full min-w-0 bg-transparent outline-none"
            />
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <OptionChip
            key={range.label}
            selected={price.min === range.min && price.max === range.max}
            onClick={() =>
              price.min === range.min && price.max === range.max
                ? onChange({ min: null, max: null })
                : onChange({ min: range.min, max: range.max })
            }
          >
            {range.label}
          </OptionChip>
        ))}
      </div>
    </div>
  );
}

/** An on/off filter row: label on the left, a 48×28 switch on the right. */
export function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="flex min-h-14 items-center justify-between border-t border-[#e7e7e7] first:border-t-0">
      <span className="font-sans text-base text-[#1f1c20]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f1c20] focus-visible:ring-offset-2",
          on ? "bg-[#1f1c20]" : "bg-[#d8d5d0]",
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] top-[3px] size-[22px] rounded-full bg-white transition-transform duration-200",
            on && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const button =
    "flex size-11 items-center justify-center rounded-full border border-[#d9d5cf] text-lg text-[#1f1c20] transition-colors hover:border-[#1f1c20] active:scale-[0.97] cursor-pointer";
  return (
    <div className="flex items-center gap-4">
      <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(value - 1)} className={button}>
        −
      </button>
      <span aria-live="polite" className="min-w-6 text-center font-sans text-base text-[#1f1c20]">
        {value}
      </span>
      <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(value + 1)} className={button}>
        +
      </button>
    </div>
  );
}
