"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Clock, ShieldCheck, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { ExperiencePrice, useCreateBooking } from "@/lib/queries/experiences";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// itin's Experience model has a single `start_time` field, not multiple
// selectable slots — these 3 are placeholder options matching the
// reference screenshots until a real slots concept exists server-side.
const TIME_SLOTS = ["06:00AM", "07:00AM", "09:00AM"];

function combineDateAndTime(date: Date, timeLabel: string): string | null {
  const match = /^(\d{1,2}):(\d{2})(AM|PM)$/i.exec(timeLabel.trim());
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

interface ExperienceBookingPanelProps {
  experienceId: string;
  guideId?: string | null;
  prices: ExperiencePrice[];
  currency: string;
  durationLabel: string;
  /** Prefills the calendar when the experience has a fixed, real scheduled date. */
  eventStartDate?: Date | null;
  className?: string;
  /** Shows a close (X) button — used when this panel is rendered as a mobile bottom sheet (see ExperienceBookingBar). */
  onClose?: () => void;
}

// Desktop sticky sidebar. Also reused as a mobile bottom sheet, opened by
// ExperienceBookingBar's "Book now" — same form either way, not duplicated.
export function ExperienceBookingPanel({
  experienceId,
  guideId,
  prices,
  currency,
  durationLabel,
  eventStartDate,
  className,
  onClose,
}: ExperienceBookingPanelProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [participants, setParticipants] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(eventStartDate ?? null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const createBooking = useCreateBooking();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cheapest = prices.reduce<ExperiencePrice | null>(
    (min, p) => (!min || p.amount < min.amount ? p : min),
    null
  );
  const selectedPrice = prices.find((p) => p.id === selectedPriceId) ?? cheapest;

  const isReady = !!selectedTime && !!selectedDate && participants > 0 && !!selectedPrice;
  const total = (selectedPrice?.amount ?? 0) * Math.max(participants, 1);
  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "Select dates";

  const handleBookNow = () => {
    if (!guideId || !selectedDate || !selectedTime || !selectedPrice) return;
    const requestedDatetime = combineDateAndTime(selectedDate, selectedTime);
    createBooking.mutate(
      {
        experience_id: experienceId,
        experience_price_id: selectedPrice.id,
        guide_id: guideId,
        requested_datetime: requestedDatetime ?? undefined,
        party_size: participants,
      },
      {
        onSuccess: (booking) => {
          if (booking.url) window.location.href = booking.url;
        },
      }
    );
  };

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
          <span className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#130404]">
            {formatPrice(selectedPrice?.amount ?? 0, currency)}
          </span>
          <span className="font-sans text-base font-normal text-[#6F6B72]">/ person</span>
        </p>
        {isReady && (
          <div className="mt-6 flex w-fit items-center gap-1 rounded-[24px] bg-[#FF5400] p-2">
            <span className="font-sans text-[14px] font-normal leading-[22px] text-white">
              Only 3 spots left for tomorrow
            </span>
          </div>
        )}
      </div>

      {prices.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Choose an option</span>
          <div className="flex flex-col gap-2">
            {prices.map((price) => (
              <button
                key={price.id}
                type="button"
                onClick={() => setSelectedPriceId(price.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  (selectedPrice?.id ?? cheapest?.id) === price.id
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted"
                )}
              >
                <span className="font-medium text-foreground">{price.label}</span>
                <span className="text-muted-foreground">{formatPrice(price.amount, currency)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-sans text-sm font-normal text-[#130404]">
          Select a starting time and your preferred date
        </span>
        <div className="flex gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={cn(
                "flex-1 rounded-[12px] border px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                selectedTime === slot
                  ? "border-transparent bg-[#2C0101] text-white"
                  : "border-[#E0DFDD] bg-white text-[#130404] hover:bg-[#F4F2EE]"
              )}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3">
        <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#130404]">
          <User className="size-4 text-[#130404]" />
          Participants
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease participants"
            disabled={participants <= 0}
            onClick={() => setParticipants((p) => Math.max(0, p - 1))}
            className="flex size-6 items-center justify-center rounded-full border border-[#F5032D] text-[#F5032D] transition-colors hover:bg-[#F5032D]/10 disabled:opacity-40 disabled:border-[#CDCDCD] disabled:text-[#CDCDCD] cursor-pointer"
          >
            −
          </button>
          <span className="min-w-[1ch] text-center font-sans text-sm font-semibold text-[#130404]">
            {participants}
          </span>
          <button
            type="button"
            aria-label="Increase participants"
            onClick={() => setParticipants((p) => p + 1)}
            className="flex size-6 items-center justify-center rounded-full border border-[#F5032D] text-[#F5032D] transition-colors hover:bg-[#F5032D]/10 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div ref={calendarRef} className="relative">
        <button
          type="button"
          onClick={() => setCalendarOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3 text-left cursor-pointer"
        >
          <span className="flex items-center gap-2 font-sans text-sm text-[#130404]">
            <Calendar className="size-4 text-[#130404]" />
            {dateLabel}
          </span>
          <ChevronDown className="size-4 text-[#130404]" />
        </button>

        {calendarOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full min-w-[320px] rounded-[28px] border border-[#e0dfdd] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <DatePickerCalendar
              selectedDate={selectedDate}
              minDate={new Date()}
              presets={computeDatePresets()}
              onSelect={(date) => {
                setSelectedDate(date);
                setCalendarOpen(false);
              }}
            />
          </div>
        )}
      </div>

      {!guideId ? (
        <p className="text-center text-xs text-muted-foreground">
          This experience isn&apos;t available for booking yet.
        </p>
      ) : (
        <Button
          size="cta"
          disabled={!isReady || createBooking.isPending}
          onClick={handleBookNow}
          className="w-full"
        >
          {createBooking.isPending ? "Starting checkout…" : "Book now"}
        </Button>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="font-sans text-lg font-bold text-[#130404]">Total</span>
        <span className="font-sans text-xl font-bold text-[#130404]">
          {formatPrice(total, currency)}
        </span>
      </div>

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
            <p className="text-sm text-foreground">Duration — {durationLabel}</p>
            <p className="text-xs text-muted-foreground">See time slots above</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile sticky summary bar — tapping "Book now" opens the full
// ExperienceBookingPanel as a bottom sheet (owned by the parent, see
// app/experiences/[id]/content.tsx) rather than duplicating the form here.
export function ExperienceBookingBar({
  priceFrom,
  currency,
  onBookNow,
}: {
  priceFrom: number;
  currency: string;
  onBookNow: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-card px-6 py-4 lg:hidden">
      <div>
        <p className="text-sm font-semibold text-foreground">from {formatPrice(priceFrom, currency)}</p>
        <p className="text-xs text-brand">Free cancellation valid for 24hrs</p>
      </div>
      <Button size="cta" onClick={onBookNow}>
        Book now
      </Button>
    </div>
  );
}
