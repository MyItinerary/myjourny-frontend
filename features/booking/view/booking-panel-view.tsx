"use client";

import { Check, User, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import type { BookingPanelViewModel } from "../view-model/use-booking-panel-view-model";
import { BookButton, InfoRow, Notice, PillRow, UrgencyBadge } from "./booking-card-parts";
import { SessionDateView, SessionTimesView } from "./session-picker-view";
import { Stepper } from "./stepper";

type Props = BookingPanelViewModel & {
  className?: string;
  /** Turns the card into the mobile bottom sheet, with its handle, title and close button. */
  onClose?: () => void;
  /** The sheet's title: the experience. */
  title?: string;
};

/** The booking card: a sticky 400px card on desktop and a bottom sheet on mobile.
 * Order is date, time, guests, total, button. Red is the button's alone; amber is urgency's alone.
 * Prices shown are always the server's quote. */
export function BookingPanelView(props: Props) {
  const { className, onClose, title, card, sessions, tickets, days, addons } = props;
  const [datesOpen, setDatesOpen] = useState(false);
  const urgent = sessions.urgency;
  const several = tickets.length > 1;

  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-5 border border-[#E7E7E7] bg-white px-7 py-8",
        onClose ? "rounded-t-[32px] border-b-0 px-5 pt-3 pb-8" : "rounded-[32px]",
        className,
      )}
    >
      {onClose && (
        <div className="-mb-2 flex flex-col items-center gap-1.5">
          <span aria-hidden className="h-1 w-9 rounded-sm bg-[#E0E0E0]" />
          <div className="flex w-full items-center justify-between">
            <p className="truncate text-lg font-medium text-[#333134]">{title}</p>
            <button type="button" aria-label="Close" onClick={onClose} className="flex size-11 shrink-0 cursor-pointer items-center justify-center">
              <X className="size-6 text-[#333134]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-2">
          {card.headline.showFrom && <span className="text-2xl font-semibold text-[#333134]">From</span>}
          <span className="text-2xl leading-8 font-semibold text-[#333134]">{card.headline.amount}</span>
          {card.headline.was && (
            <s className="text-sm text-[#6F6B72]" aria-label={`was ${card.headline.was}`}>
              {card.headline.was}
            </s>
          )}
          <span className="text-base text-[#6F6B72]">{card.headline.unit}</span>
        </p>
        {card.headline.pill && (
          <span className="w-fit rounded-full bg-[#F4F2EE] px-2 py-0.5 text-xs text-[#333134]">{card.headline.pill}</span>
        )}
        {card.notes.map((note) => (
          <p key={note} className="text-sm leading-5 text-[#6F6B72]">
            {note}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <SessionDateView sessions={sessions} label={card.dateField} locked={card.locked} open={datesOpen} onOpenChange={setDatesOpen} />
        {!datesOpen && <SessionTimesView sessions={sessions} locked={card.locked} />}
        {urgent && <UrgencyBadge {...urgent} />}

        <div className={cn("flex flex-col gap-2 pt-1", card.locked && "opacity-60")}>
          {tickets.map((ticket) => (
            <PillRow key={ticket.id} className="py-2 pr-2 pl-4">
              <span className="flex min-w-0 items-center gap-2">
                <User aria-hidden className="size-6 shrink-0 text-[#333134]" />
                <span className="flex flex-col">
                  <span className="text-base leading-[22px] text-[#333134]">{several ? ticket.label : "Guests"}</span>
                  {ticket.priceLabel && <span className="text-[13px] leading-[18px] text-[#6F6B72]">{ticket.priceLabel}</span>}
                </span>
              </span>
              <Stepper label={several ? ticket.label : "guests"} value={ticket.quantity} min={0} max={ticket.max} onChange={ticket.onChange} disabled={card.locked} />
            </PillRow>
          ))}
        </div>

        {days.show && (
          <PillRow className="py-2 pr-2 pl-4">
            <span className="text-base leading-[22px] text-[#333134]">Days</span>
            <Stepper label="days" value={days.value} min={1} max={60} onChange={days.onChange} disabled={card.locked} />
          </PillRow>
        )}

        {addons.length > 0 && (
          <fieldset className="flex flex-col">
            <legend className="text-sm font-medium text-[#333134]">Add extras</legend>
            {addons.map((addon) => (
              <label key={addon.id} className="flex cursor-pointer items-center gap-3 py-2.5">
                <input type="checkbox" className="peer sr-only" checked={addon.checked} onChange={(e) => addon.onToggle(e.target.checked)} />
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[22px] shrink-0 items-center justify-center rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-[#333134]",
                    addon.checked ? "bg-[#32070F]" : "border-[1.5px] border-[#BDBDBD]",
                  )}
                >
                  {addon.checked && <Check className="size-3.5 text-white" />}
                </span>
                <span className="min-w-0 flex-1 text-[15px] font-medium text-[#333134]">{addon.label}</span>
                <span className="text-sm text-[#333134]">{addon.priceLabel}</span>
              </label>
            ))}
          </fieldset>
        )}
      </div>

      {card.notice && (
        <Notice
          tone={card.notice.tone}
          title={card.notice.title}
          body={card.notice.body}
          action={card.notice.action?.label}
          onAction={card.notice.action?.kind === "retry" ? card.onRetry : () => setDatesOpen(true)}
        />
      )}

      <PromoCode {...props} />
      <Breakdown {...props} />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <div className="h-px bg-[#E7E7E7]" />
          <div className="flex flex-col gap-0.5">
            <div className="flex min-h-9 items-center justify-between gap-3">
              <span className="text-xl font-medium text-[#333134]">Total</span>
              {card.total.amount ? (
                <span aria-live="polite" className={cn("text-2xl font-semibold text-[#333134]", props.quote?.updating && "opacity-60")}>
                  {card.total.amount}
                </span>
              ) : (
                <span className="text-base text-[#6F6B72]">{card.total.muted}</span>
              )}
            </div>
            <p className="text-right text-[13px] leading-[18px] text-[#6F6B72]">{card.total.fees}</p>
          </div>
        </div>

        {props.booking.available ? (
          <BookButton {...card.button} />
        ) : (
          <p className="text-center text-sm text-[#6F6B72]">This experience isn&apos;t available for booking yet.</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="h-px bg-[#E7E7E7]" />
        <InfoRow {...card.cancellation} />
      </div>
    </div>
  );
}

/** "Have a promo code?" opens a small field; its message sits under it. */
function PromoCode({ promo }: BookingPanelViewModel) {
  const [open, setOpen] = useState(false);
  if (!open && !promo.input && !promo.message) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-fit cursor-pointer text-sm font-medium text-[#333134] underline">
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
          className="h-11 min-w-0 flex-1 rounded-full border border-[#E0DFDD] bg-white px-4 text-base uppercase placeholder:normal-case lg:text-sm"
        />
        <button type="submit" className="h-11 cursor-pointer rounded-full border border-[#E0DFDD] bg-white px-4 text-sm font-medium text-[#333134] hover:bg-[#F4F2EE]">
          Apply
        </button>
      </div>
      {promo.message && (
        <p className={cn("text-[13px]", promo.message.ok ? "text-[#0B7A47]" : "text-[#6F6B72]")}>{promo.message.text}</p>
      )}
    </form>
  );
}

/** The few rows above the total: add-ons, and what a group or promo code saved. */
function Breakdown({ card, quote }: BookingPanelViewModel) {
  if (card.breakdown.length === 0) return null;
  return (
    <dl className={cn("flex flex-col gap-1.5 text-[13px] leading-[18px]", quote?.updating && "opacity-60")}>
      {card.breakdown.map((row) => (
        <div key={row.key} className="flex items-center justify-between gap-3">
          <dt className="text-[#6F6B72]">{row.label}</dt>
          <dd className="text-[#6F6B72]">{row.amount}</dd>
        </div>
      ))}
    </dl>
  );
}
