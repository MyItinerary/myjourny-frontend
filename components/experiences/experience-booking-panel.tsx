"use client";

import { useState } from "react";
import { Calendar, Clock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface ExperienceBookingPanelProps {
  priceFrom: number;
  currency: string;
  durationLabel: string;
  className?: string;
}

// Desktop sticky sidebar. Mobile gets the simpler summary bar
// (ExperienceBookingBar below) instead — the full interactive panel isn't
// shown expanded on mobile in the reference screenshots (likely a
// bottom-sheet on tap, not built in this pass).
export function ExperienceBookingPanel({
  priceFrom,
  currency,
  durationLabel,
  className,
}: ExperienceBookingPanelProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [participants, setParticipants] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const isReady = !!selectedTime && !!selectedDate && participants > 0;
  const total = priceFrom * Math.max(participants, 1);

  return (
    <div className={cn("flex flex-col gap-5 rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex flex-col gap-1">
        {isReady && (
          <span className="w-fit rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700">
            Only 3 spots left for tomorrow
          </span>
        )}
        <p>
          <span className={cn("text-2xl font-semibold text-foreground", isReady && "text-muted-foreground line-through")}>
            {formatPrice(priceFrom, currency)}
          </span>
          {!isReady && <span className="ml-1 text-sm text-muted-foreground">/ person</span>}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Select a starting time and your preferred date</span>
        <div className="flex gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedTime(slot)}
              className={cn(
                "flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                selectedTime === slot
                  ? "border-transparent bg-foreground text-background"
                  : "border-border text-foreground hover:bg-muted"
              )}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-full border border-border px-4 py-3">
        <span className="text-sm text-foreground">Participants</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease participants"
            disabled={participants <= 0}
            onClick={() => setParticipants((p) => Math.max(0, p - 1))}
            className="flex size-6 items-center justify-center rounded-full bg-muted text-foreground disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[1ch] text-center text-sm font-medium">{participants}</span>
          <button
            type="button"
            aria-label="Increase participants"
            onClick={() => setParticipants((p) => p + 1)}
            className="flex size-6 items-center justify-center rounded-full bg-brand text-white"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSelectedDate(selectedDate ? "" : "Tomorrow")}
        className="flex items-center justify-between rounded-full border border-border px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm text-foreground">
          <Calendar className="size-4" />
          {selectedDate || "Select dates"}
        </span>
        <span className="text-muted-foreground">⌄</span>
      </button>

      <Button size="cta" disabled={!isReady} className="w-full">
        Book now
      </Button>

      {isReady && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold text-foreground">{formatPrice(total, currency)}</span>
        </div>
      )}

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

// Mobile sticky summary bar.
export function ExperienceBookingBar({ priceFrom, currency }: { priceFrom: number; currency: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-card px-6 py-4 lg:hidden">
      <div>
        <p className="text-sm font-semibold text-foreground">from {formatPrice(priceFrom, currency)}</p>
        <p className="text-xs text-brand">Free cancellation valid for 24hrs</p>
      </div>
      <Button size="cta">Book now</Button>
    </div>
  );
}
