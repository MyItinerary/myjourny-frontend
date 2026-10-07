"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, Clock, ShieldCheck, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeDatePresets, DatePickerCalendar } from "@/components/shared/date-picker-calendar";
import { ExperiencePrice, useCreateBooking } from "@/lib/queries/experiences";
import {
  PriceRule,
  PricingSelection,
  PricingUnit,
  TicketType,
  useBookingQuote,
  useExperiencePricing,
} from "@/lib/queries/pricing";
import {
  dateKey,
  ExperienceSession,
  formatSessionTime,
  middayOf,
  parseDateKey,
  useExperienceSessions,
} from "@/lib/queries/sessions";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function tomorrowKey(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return dateKey(tomorrow);
}

const UNIT_SUFFIX: Record<PricingUnit, string> = {
  per_person: "/ person",
  per_booking: "/ group",
  per_day: "/ person / day",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Short, customer-facing descriptions of the curator's pricing rules.
function describeRule(rule: PriceRule, currency: string): string | null {
  if (rule.kind === "group" && rule.min_guests && rule.percent_off) {
    return `${Number(rule.percent_off)}% off for ${rule.min_guests}+ guests`;
  }
  if (rule.kind === "early_bird" && rule.book_before) {
    const until = new Date(rule.book_before).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
    return rule.unit_amount != null
      ? `Early-bird price ${formatPrice(Number(rule.unit_amount), currency)} when booked before ${until}`
      : `${Number(rule.percent_off)}% early-bird discount when booked before ${until}`;
  }
  if (rule.kind === "day_of_week" && rule.days_of_week?.length && rule.unit_amount != null) {
    const days = rule.days_of_week.map((d) => WEEKDAYS[d]).join(", ");
    return `${rule.label ?? "Special rate"}: ${formatPrice(Number(rule.unit_amount), currency)} on ${days}`;
  }
  return null;
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const buttonClass =
    "flex size-6 items-center justify-center rounded-full border border-[#F5032D] text-[#F5032D] transition-colors hover:bg-[#F5032D]/10 disabled:opacity-40 disabled:border-[#CDCDCD] disabled:text-[#CDCDCD] cursor-pointer disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={buttonClass}
      >
        −
      </button>
      <span className="min-w-[1ch] text-center font-sans text-sm font-semibold text-[#130404]">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
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
  /** Number of remaining available spots. Defaults to 10 or group_size_max. */
  availableSpots?: number;
  /** Minimum number of spots / participants. Defaults to 1 or group_size_min. */
  minSpots?: number;
}

// Desktop sticky sidebar. Also reused as a mobile bottom sheet, opened by
// ExperienceBookingBar's "Book now" — same form either way, not duplicated.
//
// The customer picks ticket quantities, add-ons, days (for per-day tickets)
// and a promo code; the price shown is always the server's quote
// (POST /bookings/quote), the same engine that prices the booking itself.
export function ExperienceBookingPanel({
  experienceId,
  guideId,
  prices,
  currency,
  durationLabel,
  eventStartDate,
  className,
  onClose,
  availableSpots,
  minSpots = 1,
}: ExperienceBookingPanelProps) {
  const maxSpots = availableSpots ?? 10;
  const minParticipants = Math.max(1, minSpots ?? 1);
  const { data: pricing } = useExperiencePricing(experienceId);
  const { data: sessionData } = useExperienceSessions(experienceId);
  // The day ("YYYY-MM-DD") and session picked; until then the first open
  // session (or, without a schedule, the event date or tomorrow) is used.
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedSessionAt, setPickedSessionAt] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Quantities the customer has set; tickets they haven't touched fall back
  // to the defaults below.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState(1);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const createBooking = useCreateBooking();
  const router = useRouter();
  const bookingAttemptKey = useRef<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tickets: TicketType[] =
    pricing?.prices ??
    prices.map((p) => ({ ...p, pricing_unit: "per_person" as PricingUnit }));
  const addons = pricing?.addons ?? [];
  const ruleNotes = (pricing?.rules ?? [])
    .map((rule) => describeRule(rule, currency))
    .filter((note): note is string => !!note);

  const cheapest = tickets.reduce<TicketType | null>(
    (min, t) => (!min || Number(t.amount) < Number(min.amount) ? t : min),
    null
  );
  // By default the cheapest ticket type gets the minimum group size.
  const quantityOf = (ticketId: string) =>
    quantities[ticketId] ?? (ticketId === cheapest?.id ? minParticipants : 0);
  const guests = tickets.reduce((sum, t) => sum + quantityOf(t.id), 0);
  const needsDays = tickets.some((t) => t.pricing_unit === "per_day" && quantityOf(t.id) > 0);

  // Sessions come from the admin's schedule; the API rejects any other time.
  const scheduled = sessionData?.scheduled ?? false;
  const byDate = useMemo(() => {
    const map = new Map<string, ExperienceSession[]>();
    for (const s of sessionData?.sessions ?? []) {
      map.set(s.local_date, [...(map.get(s.local_date) ?? []), s]);
    }
    return map;
  }, [sessionData]);
  const hasOpenSession = (day: string) => (byDate.get(day) ?? []).some((s) => !s.sold_out);
  const firstOpenDay = [...byDate.keys()].find(hasOpenSession) ?? null;
  const eventDay = eventStartDate ? dateKey(eventStartDate) : null;
  const selectedDay =
    pickedDay ??
    (scheduled
      ? firstOpenDay
      : eventDay && eventDay > tomorrowKey()
        ? eventDay
        : tomorrowKey());
  const daySessions = scheduled && selectedDay ? (byDate.get(selectedDay) ?? []) : [];
  const session =
    daySessions.find((s) => s.starts_at === pickedSessionAt && !s.sold_out) ??
    daySessions.find((s) => !s.sold_out) ??
    null;
  const requestedDatetime = scheduled
    ? (session?.starts_at ?? null)
    : selectedDay
      ? middayOf(selectedDay)
      : null;
  const isDateEnabled = scheduled ? (date: Date) => hasOpenSession(dateKey(date)) : undefined;
  const selection: PricingSelection | null = useMemo(() => {
    const items = tickets
      .map((t) => ({ experience_price_id: t.id, quantity: quantityOf(t.id) }))
      .filter((i) => i.quantity > 0);
    if (items.length === 0) return null;
    return {
      experience_id: experienceId,
      items,
      addons: addons
        .filter((a) => selectedAddons[a.id])
        .map((a) => ({ addon_id: a.id, quantity: 1 })),
      requested_datetime: requestedDatetime ?? undefined,
      days: needsDays ? days : undefined,
      promo_code: appliedPromo ?? undefined,
    };
    // quantityOf reads `quantities`, `cheapest` and `minParticipants`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceId, tickets, quantities, minParticipants, addons, selectedAddons, requestedDatetime, needsDays, days, appliedPromo]);

  const { data: quote, isFetching: quoting, isError: quoteFailed } = useBookingQuote(selection);
  const selectionKey = JSON.stringify(selection);

  // A different selection is a new booking attempt with its own key.
  useEffect(() => {
    bookingAttemptKey.current = null;
  }, [selectionKey]);

  const isReady =
    !!requestedDatetime &&
    !!selection &&
    guests >= minParticipants &&
    guests <= maxSpots &&
    !!quote &&
    !quoteFailed;
  const total = quote ? Number(quote.total) : 0;
  const dateLabel = selectedDay
    ? parseDateKey(selectedDay).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : "Select dates";

  const setQuantity = (ticketId: string, value: number) =>
    setQuantities((q) => ({ ...q, [ticketId]: value }));

  const handleBookNow = () => {
    if (!guideId || !selection || !isReady) return;
    // One key per booking attempt: re-clicking reuses it, so the server
    // returns the booking it already created instead of a second one.
    bookingAttemptKey.current ??= crypto.randomUUID();
    createBooking.mutate(
      { ...selection, idempotencyKey: bookingAttemptKey.current, guide_id: guideId },
      {
        onSuccess: (booking) => {
          if (booking.url) window.location.href = booking.url;
          // Free experiences are confirmed straight away, with no checkout.
          else if (booking.status === "confirmed") router.push(`/bookings/${booking.id}/success`);
        },
        onError: () => {
          bookingAttemptKey.current = null;
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
          {tickets.length > 1 && (
            <span className="font-sans text-base font-normal text-[#6F6B72]">from</span>
          )}
          <span className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#130404]">
            {formatPrice(Number(cheapest?.amount ?? 0), currency)}
          </span>
          <span className="font-sans text-base font-normal text-[#6F6B72]">
            {UNIT_SUFFIX[cheapest?.pricing_unit ?? "per_person"]}
          </span>
        </p>
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
        {scheduled && byDate.size === 0 ? (
          <span className="font-sans text-sm text-[#130404]">
            No upcoming sessions yet. Check back soon.
          </span>
        ) : scheduled ? (
          <>
            <span className="font-sans text-sm font-normal text-[#130404]">
              Select your preferred date and a starting time
            </span>
            <div className="flex flex-wrap gap-2">
              {daySessions.map((s) => {
                const note = s.sold_out
                  ? "Sold out"
                  : s.seats_left !== null && s.seats_left <= 5
                    ? `${s.seats_left} left`
                    : null;
                return (
                  <button
                    key={s.starts_at}
                    type="button"
                    disabled={s.sold_out}
                    onClick={() => setPickedSessionAt(s.starts_at)}
                    className={cn(
                      "flex-1 rounded-[12px] border px-3 py-2 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                      session?.starts_at === s.starts_at
                        ? "border-transparent bg-[#2C0101] text-white"
                        : "border-[#E0DFDD] bg-white text-[#130404] hover:bg-[#F4F2EE]"
                    )}
                  >
                    {formatSessionTime(s.local_time)}
                    {note && <span className="block text-[10px] font-normal">{note}</span>}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-[#6F6B72]">Times are local to the experience.</span>
          </>
        ) : (
          <span className="font-sans text-sm font-normal text-[#130404]">
            Select your preferred date. The host will confirm the start time with you.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {tickets.length > 1 && (
          <span className="font-sans text-sm font-normal text-[#130404]">Tickets</span>
        )}
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3"
          >
            <span className="flex flex-col">
              <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#130404]">
                <User className="size-4 text-[#130404]" />
                {tickets.length > 1 ? ticket.label : "Participants"}
              </span>
              {tickets.length > 1 && (
                <span className="pl-6 text-xs text-[#6F6B72]">
                  {formatPrice(Number(ticket.amount), currency)} {UNIT_SUFFIX[ticket.pricing_unit]}
                </span>
              )}
            </span>
            <Stepper
              label={ticket.label}
              value={quantityOf(ticket.id)}
              min={0}
              max={Math.max(0, maxSpots - guests + quantityOf(ticket.id))}
              onChange={(value) => setQuantity(ticket.id, value)}
            />
          </div>
        ))}
        {guests < minParticipants && (
          <p className="text-xs text-[#F5032D]">This experience needs at least {minParticipants} guests.</p>
        )}
      </div>

      {needsDays && (
        <div className="flex items-center justify-between rounded-[24px] bg-[#F4F2EE] px-4 py-3">
          <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#130404]">
            <Calendar className="size-4 text-[#130404]" />
            Days
          </span>
          <Stepper label="days" value={days} min={1} max={60} onChange={setDays} />
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
                  checked={!!selectedAddons[addon.id]}
                  onChange={(e) =>
                    setSelectedAddons((s) => ({ ...s, [addon.id]: e.target.checked }))
                  }
                  className="size-4 accent-[#2C0101]"
                />
                <span className="font-medium text-foreground">{addon.label}</span>
              </span>
              <span className="text-muted-foreground">
                {formatPrice(Number(addon.amount), currency)}
                {addon.pricing_unit === "per_person" ? " / person" : ""}
              </span>
            </label>
          ))}
        </div>
      )}

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
              selectedDate={selectedDay ? parseDateKey(selectedDay) : null}
              minDate={scheduled ? new Date() : parseDateKey(tomorrowKey())}
              isDateEnabled={isDateEnabled}
              presets={computeDatePresets().filter(
                (p) =>
                  (!isDateEnabled || isDateEnabled(p.date)) &&
                  (scheduled || dateKey(p.date) >= tomorrowKey())
              )}
              onSelect={(date) => {
                setPickedDay(dateKey(date));
                setPickedSessionAt(null);
                setCalendarOpen(false);
              }}
            />
          </div>
        )}
      </div>

      <form
        className="flex flex-col gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedPromo(promoInput.trim() || null);
        }}
      >
        <div className="flex gap-2">
          <input
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Promo code"
            aria-label="Promo code"
            className="flex-1 rounded-[24px] border border-[#E0DFDD] bg-white px-4 py-2 text-sm uppercase placeholder:normal-case"
          />
          <Button type="submit" variant="outline" className="rounded-[24px]">
            Apply
          </Button>
        </div>
        {appliedPromo && quote && (
          <p className={cn("text-xs", quote.promo_applied ? "text-green-700" : "text-[#F5032D]")}>
            {quote.promo_applied ? `${quote.promo_code} applied` : quote.promo_message}
          </p>
        )}
      </form>

      {quote && (
        <div className={cn("flex flex-col gap-1 text-sm", quoting && "opacity-60")}>
          {quote.lines.map((line, index) => (
            <div key={`${line.kind}-${index}`} className="flex items-center justify-between">
              <span className="text-[#6F6B72]">
                {line.label}
                {line.kind !== "discount" && line.kind !== "fee" && line.quantity > 1
                  ? ` × ${line.quantity}`
                  : ""}
              </span>
              <span className={cn(line.kind === "discount" ? "text-green-700" : "text-[#130404]")}>
                {formatPrice(Number(line.amount), currency)}
              </span>
            </div>
          ))}
        </div>
      )}
      {quoteFailed && (
        <p className="text-xs text-[#F5032D]">We couldn&apos;t price this selection. Please adjust it and try again.</p>
      )}

      {!guideId ? (
        <p className="text-center text-xs text-muted-foreground">
          This experience isn&apos;t available for booking yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            size="cta"
            disabled={!isReady || quoting || createBooking.isPending}
            onClick={handleBookNow}
            className="w-full bg-[#F5032D] text-white hover:bg-[#d90328] font-sans text-base font-semibold shadow-sm transition-all"
          >
            {createBooking.isPending ? "Starting checkout…" : `Book now - ${formatPrice(total, currency)}`}
          </Button>
          <p className="text-center text-xs text-[#6F6B72]">
            You won&apos;t be charged yet. You&apos;ll confirm on the next step.
          </p>
          <Link
            href="/checkout-preview"
            className="text-center font-sans text-xs font-medium text-brand hover:underline"
          >
            Preview &apos;Confirm details &amp; pay&apos; page &rarr;
          </Link>
        </div>
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
            <p className="text-sm text-foreground">Duration - {durationLabel}</p>
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

// Shown instead of the booking form for guests: quotes and checkout need an
// account, so the panel just shows the price and sends them to log in,
// coming back here afterwards.
export function GuestBookingCard({
  priceFrom,
  currency,
  experienceId,
  className,
}: {
  priceFrom: number | null;
  currency: string;
  experienceId: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 rounded-2xl border border-border bg-card p-6", className)}>
      {priceFrom !== null && (
        <p className="flex items-baseline gap-1">
          <span className="font-sans text-base font-normal text-[#6F6B72]">from</span>
          <span className="font-sans text-[32px] font-extrabold leading-[1.2] text-[#130404]">
            {formatPrice(priceFrom, currency)}
          </span>
        </p>
      )}
      <Button size="cta" className="w-full" render={<Link href={guestLoginHref(experienceId)} />}>
        Log in to book
      </Button>
      <p className="text-center text-sm text-[#6F6B72]">
        You&apos;ll see the host and exact meeting point once you&apos;re signed in.
      </p>
    </div>
  );
}

export function guestLoginHref(experienceId: string) {
  return `/login?next=${encodeURIComponent(`/experiences/${experienceId}`)}`;
}
