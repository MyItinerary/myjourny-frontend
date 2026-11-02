"use client";

import { CalendarDays, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

import type { EventBookingCardProps, EventTierRow } from "../view-model/use-event-booking-card-view-model";
import {
  BookingCardActionView,
  BookingCardIconTile,
  BookingCardShell,
  BookingCardStepperButton,
  BookingCardTotalView,
} from "./booking-sheet-parts";

type Props = EventBookingCardProps & {
  className?: string;
  /** Shows the sheet header with a close button, for the mobile bottom sheet. */
  onClose?: () => void;
  /** The sheet header's title. */
  title?: string;
};

const MARKER_STYLES = {
  urgency: "bg-[#FFF0D6] text-[#7A4100]",
  plain: "bg-[#F4F2EE] text-[#6F6B72]",
  strong: "bg-[#F4F2EE] text-[#333134]",
} as const;

function TierCard({ tier }: { tier: EventTierRow }) {
  const closed = tier.status !== "available";
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-2xl bg-white px-4 py-3.5",
        tier.selected ? "border-2 border-[#32070F]" : "border border-[#E7E7E7]",
        closed && "bg-[#FAFAFA]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className={cn("font-sans text-base leading-6 font-medium", closed ? "text-[#6F6B72]" : "text-[#333134]")}>
            {tier.name}
          </p>
          {tier.description && (
            <p className="font-sans text-[13px] leading-[18px] text-[#6F6B72]">{tier.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <p
            className={cn(
              "font-sans text-base leading-6 font-medium",
              tier.status === "ended" && "text-[#6F6B72] line-through",
              tier.status !== "ended" && (closed ? "text-[#6F6B72]" : "text-[#333134]"),
            )}
          >
            {tier.priceLabel}
          </p>
          {tier.perPersonLabel && (
            <p className="font-sans text-xs leading-[18px] text-[#6F6B72]">{tier.perPersonLabel}</p>
          )}
        </div>
      </div>

      <div className="flex min-h-[30px] items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {tier.marker && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-sans text-[13px] leading-[18px] font-medium",
                MARKER_STYLES[tier.marker.tone],
              )}
            >
              {tier.marker.tone === "urgency" && <Clock className="size-3.5" aria-hidden />}
              {tier.marker.label}
            </span>
          )}
        </div>
        {!closed && (
          <span className="flex shrink-0 items-center gap-1">
            <BookingCardStepperButton
              action="minus"
              size="lg"
              label={`Decrease ${tier.name}`}
              disabled={!tier.canDecrease}
              onClick={tier.onDecrease}
            />
            <span className="w-6 text-center font-sans text-base leading-4 font-medium text-[#333134]">
              {tier.quantity}
            </span>
            <BookingCardStepperButton
              action="plus"
              size="lg"
              label={`Increase ${tier.name}`}
              disabled={!tier.canIncrease}
              onClick={tier.onIncrease}
            />
          </span>
        )}
      </div>
    </div>
  );
}

/** The booking card on an event page: the date, ticket tiers with
 * steppers, total and the book button. */
export function EventBookingCardView({ className, onClose, title, ...card }: Props) {
  return (
    <BookingCardShell className={className} onClose={onClose} title={title}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#F4F2EE] px-3.5 py-3">
        <BookingCardIconTile icon={CalendarDays} tone="white" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="font-sans text-base leading-6 font-medium text-[#333134]">{card.date.title}</p>
          {card.date.subtitle && (
            <p className="font-sans text-sm leading-5 text-[#6F6B72]">{card.date.subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {card.tiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} />
        ))}
      </div>

      <BookingCardTotalView total={card.total} />
      <BookingCardActionView action={card.action} />
    </BookingCardShell>
  );
}
