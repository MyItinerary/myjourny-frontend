"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { ExperienceBookingCardProps } from "../view-model/use-experience-booking-card-view-model";
import { BookingCardStepperButton } from "./booking-card-parts";

// The parts of the experience card the design doesn't draw but bookings
// need: days for per-day tickets, add-ons and a promo code.
// They only show when the experience has them.

/** Days to book, for per-day tickets. */
export function DaysRow({ days }: { days: ExperienceBookingCardProps["days"] }) {
  return (
    <div className="flex items-center justify-between rounded-full bg-[#F4F2EE] py-2 pr-2 pl-4">
      <span className="flex items-center gap-2 font-sans text-base leading-[22px] text-[#333134]">
        <CalendarDays className="size-6 shrink-0" aria-hidden />
        Days
      </span>
      <span className="flex items-center gap-1">
        <BookingCardStepperButton
          action="minus"
          size="sm"
          label="Decrease days"
          disabled={days.value <= 1}
          onClick={() => days.onChange(Math.max(1, days.value - 1))}
        />
        <span className="w-7 text-center font-sans text-base leading-4 font-medium text-[#333134]">{days.value}</span>
        <BookingCardStepperButton
          action="plus"
          size="sm"
          label="Increase days"
          disabled={days.value >= 60}
          onClick={() => days.onChange(Math.min(60, days.value + 1))}
        />
      </span>
    </div>
  );
}

export function Addons({ addons }: Pick<ExperienceBookingCardProps, "addons">) {
  return (
    <fieldset className="flex flex-col gap-2 pt-1">
      <legend className="pb-2 font-sans text-sm leading-[22px] font-medium text-[#333134]">Add extras</legend>
      {addons.map((addon) => (
        <label
          key={addon.id}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#E7E7E7] px-4 py-3 font-sans text-sm text-[#333134]"
        >
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={addon.checked}
              onChange={(e) => addon.onToggle(e.target.checked)}
              className="size-4 accent-[#32070F]"
            />
            <span className="font-medium">{addon.label}</span>
          </span>
          <span className="text-[#6F6B72]">{addon.priceLabel}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** "Have a promo code?" folds open into a field and an Apply button. */
export function PromoCode({ promo }: Pick<ExperienceBookingCardProps, "promo">) {
  const [open, setOpen] = useState(false);
  if (!open && !promo.message) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit cursor-pointer font-sans text-sm leading-[22px] font-medium text-[#333134] underline underline-offset-2"
      >
        Have a promo code?
      </button>
    );
  }
  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        promo.onApply();
      }}
    >
      <div className="flex gap-2">
        <input
          value={promo.input}
          onChange={(e) => promo.onInputChange(e.target.value)}
          placeholder="Promo code"
          aria-label="Promo code"
          className="h-11 min-w-0 flex-1 rounded-full border border-[#E0DFDD] bg-white px-4 font-sans text-sm uppercase placeholder:normal-case"
        />
        <button
          type="submit"
          className="h-11 cursor-pointer rounded-full border border-[#E0DFDD] px-5 font-sans text-sm font-medium text-[#333134] hover:bg-[#F4F2EE]"
        >
          Apply
        </button>
      </div>
      {promo.message && (
        <p className={cn("font-sans text-xs leading-4", promo.message.ok ? "text-[#02A078]" : "text-[#F5032D]")}>
          {promo.message.text}
        </p>
      )}
    </form>
  );
}
