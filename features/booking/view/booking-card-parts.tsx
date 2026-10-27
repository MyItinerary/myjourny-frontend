"use client";

import { Ban, CalendarCheck, CloudRain, Minus, Plus, Users, X, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type {
  BookingCardAction,
  BookingCardInfoIcon,
  BookingCardInfoRow,
  BookingCardPrice,
  BookingCardTotal,
} from "../model/booking-card.types";

const INFO_ICONS: Record<BookingCardInfoIcon, LucideIcon> = {
  cancellation: CalendarCheck,
  refund: Ban,
  weather: CloudRain,
  group: Users,
};

/** The white rounded frame both booking cards share. */
export function BookingCardShell({
  className,
  onClose,
  children,
}: {
  className?: string;
  /** Shows a close button, for the mobile bottom sheet. */
  onClose?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-5 rounded-[32px] border border-[#E7E7E7] bg-white px-7 py-8",
        className,
      )}
    >
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#F4F2EE] text-[#333134]"
        >
          <X className="size-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function BookingCardPriceView({ price }: { price: BookingCardPrice }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-sans text-2xl leading-8 font-semibold text-[#333134]">
        {price.prefix ? `${price.prefix} ` : ""}
        {price.amount}
      </span>
      <span className="font-sans text-base leading-6 text-[#6F6B72]">{price.unit}</span>
    </p>
  );
}

/** 40px rounded tile holding a 22px icon. */
export function BookingCardIconTile({ icon: Icon, tone = "cream" }: { icon: LucideIcon; tone?: "cream" | "white" }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[7.6px]",
        tone === "cream" ? "bg-[#F4F2EE]" : "bg-white",
      )}
    >
      <Icon className="size-[22px] text-[#333134]" aria-hidden />
    </span>
  );
}

/** Round minus/plus button. 32px in a guest row, 44px on an event tier. */
export function BookingCardStepperButton({
  action,
  label,
  size,
  disabled,
  onClick,
}: {
  action: "minus" | "plus";
  label: string;
  size: "sm" | "lg";
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = action === "minus" ? Minus : Plus;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[#333134] transition-colors disabled:cursor-not-allowed",
        size === "sm" ? "size-8" : "size-11",
        disabled
          ? "border-transparent bg-[#EEEEEE] text-[#B3B0B5]"
          : "border border-[#E0DFDD] bg-white hover:bg-[#F4F2EE]",
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-4"} aria-hidden />
    </button>
  );
}

export function BookingCardTotalView({ total }: { total: BookingCardTotal }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-px w-full bg-[#E7E7E7]" />
      <div className="flex flex-col gap-0.5">
        <div className="flex min-h-9 items-center justify-between text-[#333134]">
          <span className="font-sans text-xl leading-[30px] font-medium">Total</span>
          {total.amount ? (
            <span className="font-sans text-2xl leading-9 font-semibold">{total.amount}</span>
          ) : (
            <span className="font-sans text-base text-[#6F6B72]">{total.hint}</span>
          )}
        </div>
        {total.note && <p className="text-right font-sans text-[13px] leading-[18px] text-[#6F6B72]">{total.note}</p>}
      </div>
    </div>
  );
}

/** The red book button. Red is for this alone. */
export function BookingCardActionView({ action }: { action: BookingCardAction }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={action.disabled}
        aria-busy={action.pending}
        onClick={action.onClick}
        className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-4 py-3 font-sans text-base leading-6 font-medium text-white transition-colors hover:bg-[#d90328] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {action.label}
      </button>
    </div>
  );
}

export function BookingCardInfoRows({ rows }: { rows: BookingCardInfoRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="h-px w-full bg-[#E7E7E7]" />
      {rows.map((row) => (
        <div key={row.id} className="flex items-start gap-3">
          <BookingCardIconTile icon={INFO_ICONS[row.icon]} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-sans text-base leading-6 font-medium text-[#333134]">{row.title}</p>
            <p className="font-sans text-sm leading-[22px] text-[#6F6B72]">{row.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
