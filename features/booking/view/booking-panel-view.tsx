"use client";

import { Calendar, Clock, ShieldCheck, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { BookingPanelViewModel } from "../view-model/use-booking-panel-view-model";
import { SessionDateView, SessionTimesView } from "./session-picker-view";
import { Stepper } from "./stepper";

type Props = BookingPanelViewModel & {
  className?: string;
  /** Shows a close button, for the mobile bottom sheet. */
  onClose?: () => void;
};

/** The booking form: a sticky sidebar on desktop and a bottom sheet on mobile.
 * Prices shown are always the server's quote. */
export function BookingPanelView(props: Props) {
  const { className, onClose, priceFrom, ruleNotes, sessions, tickets, minGuestsWarning, days, addons } = props;
  return (
    <div className={cn("relative flex flex-col gap-5 rounded-2xl border border-border bg-card p-6", className)}>
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-muted text-foreground"
        >
          <X className="size-4" />
        </button>
      )}

      <div className="flex flex-col items-start">
        <p className="flex items-baseline gap-1">
          {priceFrom.showFrom && <span className="font-sans text-base font-normal text-[#6F6B72]">from</span>}
          <span className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#130404]">{priceFrom.amount}</span>
          <span className="font-sans text-base font-normal text-[#6F6B72]">{priceFrom.unit}</span>
        </p>
        {props.scheduleLabel && (
          <p className="mt-1 font-sans text-sm font-medium text-[#130404]">{props.scheduleLabel}</p>
        )}
        {ruleNotes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {ruleNotes.map((note) => (
              <li key={note} className="text-xs font-medium text-[#FF5400]">
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <SessionTimesView {...sessions} />
      </div>

      <div className="flex flex-col gap-2">
        {tickets.length > 1 && <span className="font-sans text-sm font-normal text-[#130404]">Tickets</span>}
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3">
            <span className="flex flex-col">
              <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#130404]">
                <User className="size-4 text-[#130404]" />
                {ticket.label}
              </span>
              {ticket.priceLabel && <span className="pl-6 text-xs text-[#6F6B72]">{ticket.priceLabel}</span>}
            </span>
            <Stepper label={ticket.label} value={ticket.quantity} min={0} max={ticket.max} onChange={ticket.onChange} />
          </div>
        ))}
        {minGuestsWarning && <p className="text-xs text-[#F5032D]">{minGuestsWarning}</p>}
        {props.seatsWarning && <p className="text-xs text-[#F5032D]">{props.seatsWarning}</p>}
        {props.lengthNote && <p className="text-xs text-[#6F6B72]">{props.lengthNote}</p>}
      </div>

      {days.show && (
        <div className="flex items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3">
          <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#130404]">
            <Calendar className="size-4 text-[#130404]" />
            Days
          </span>
          <Stepper label="days" value={days.value} min={1} max={60} onChange={days.onChange} />
        </div>
      )}

      {addons.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-sans text-sm font-normal text-[#130404]">Add extras</span>
          {addons.map((addon) => (
            <label
              key={addon.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={addon.checked}
                  onChange={(e) => addon.onToggle(e.target.checked)}
                  className="size-4 accent-[#2C0101]"
                />
                <span className="font-medium text-foreground">{addon.label}</span>
              </span>
              <span className="text-muted-foreground">{addon.priceLabel}</span>
            </label>
          ))}
        </div>
      )}

      <SessionDateView {...sessions} />

      <CheckoutSummary {...props} />

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm text-foreground">Free cancellation</p>
            <p className="text-xs text-muted-foreground">Up to 24 hours before, full refund</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-sm text-foreground">Duration - {props.durationLabel}</p>
            <p className="text-xs text-muted-foreground">See time slots above</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Promo code, the quote's lines, the book button and the total. */
function CheckoutSummary({ promo, quote, quoteError, booking, total }: BookingPanelViewModel) {
  return (
    <>
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
            className="flex-1 rounded-[24px] border border-[#E0DFDD] bg-white px-4 py-2 text-sm uppercase placeholder:normal-case"
          />
          <Button type="submit" variant="outline" className="rounded-[24px]">
            Apply
          </Button>
        </div>
        {promo.message && (
          <p className={cn("text-xs", promo.message.ok ? "text-green-700" : "text-[#F5032D]")}>{promo.message.text}</p>
        )}
      </form>

      {quote && (
        <div className={cn("flex flex-col gap-1 text-sm", quote.updating && "opacity-60")}>
          {quote.when && <p className="pb-1 font-medium text-[#130404]">{quote.when}</p>}
          {quote.lines.map((line) => (
            <div
              key={line.key}
              className={cn(
                "flex items-center justify-between",
                line.kind === "subtotal" && "mt-1 border-t border-border pt-1",
              )}
            >
              <span className={cn(line.kind === "subtotal" ? "font-medium text-[#130404]" : "text-[#6F6B72]")}>
                {line.label}
              </span>
              <span className="flex items-baseline gap-2">
                {line.listAmount && (
                  <s className="text-xs text-[#6F6B72]" aria-label={`was ${line.listAmount}`}>
                    {line.listAmount}
                  </s>
                )}
                <span className={cn(line.kind === "discount" ? "text-green-700" : "text-[#130404]")}>{line.amount}</span>
              </span>
            </div>
          ))}
          {quote.savings && <p className="pt-1 text-right text-xs font-medium text-green-700">{quote.savings}</p>}
        </div>
      )}
      {quoteError && <p className="text-xs text-[#F5032D]">{quoteError}</p>}

      {!booking.available ? (
        <p className="text-center text-xs text-muted-foreground">This experience isn&apos;t available for booking yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            size="cta"
            disabled={booking.disabled}
            onClick={booking.onBook}
            className="w-full bg-[#F5032D] text-white hover:bg-[#d90328] font-sans text-base font-semibold shadow-sm transition-all"
          >
            {booking.label}
          </Button>
          <p className="text-center text-xs text-[#6F6B72]">You won&apos;t be charged yet. You&apos;ll confirm on the next step.</p>
        </div>
      )}

      {total && (
        <div className="flex items-center justify-between pt-1">
          <span className="font-sans text-lg font-bold text-[#130404]">Total</span>
          <span className="font-sans text-xl font-bold text-[#130404]">{total}</span>
        </div>
      )}
    </>
  );
}
