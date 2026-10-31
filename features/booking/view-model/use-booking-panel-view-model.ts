import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import type { PricingSelection, Quote } from "../model/booking.types";
import { useCreateBooking } from "../model/bookings";
import {
  breakdownRows,
  type BreakdownRow,
  cancellationTerms,
  groupHeadline,
  shortDay,
  shortPrice,
  shortPriceOrFree,
} from "../model/booking-card";
import { formatPrice, formatSessionDay, formatSessionWhen, trimWholeAmount } from "../model/format";
import { useBookingQuote, useExperiencePricing } from "../model/pricing";
import { dateKey, useExperienceSessions } from "../model/sessions";
import { type SessionChoice, useSessionChoice } from "./use-session-choice";
import { type TicketSelection, useTicketSelection } from "./use-ticket-selection";

export type BookingPanelProps = {
  experienceId: string;
  guideId?: string | null;
  /** Ticket prices from the experience, used until the full pricing loads. */
  prices: { id: string; label: string; amount: number | string }[];
  currency: string;
  durationLabel: string;
  /** Prefills the calendar when the experience has a fixed, real scheduled date. */
  eventStartDate?: Date | null;
  /** Most guests per booking. Defaults to 10. */
  availableSpots?: number;
  /** Fewest guests per booking. Defaults to 1. */
  minSpots?: number;
  /** The experience's own cancellation policy text, shown in the tooltip. */
  cancellationPolicy?: string | null;
  /** The structured policy (itin#113): full_refund_until, non_refundable or custom. */
  refundPolicy?: string | null;
  freeCancellationHours?: number | null;
  /** Set for guests: they pick tickets and a date like anyone else, and
   * "Book now" hands what they picked to this callback (to collect their
   * details) instead of creating a booking. */
  onGuestBook?: (details: GuestBookingDetails) => void;
};

/** What a guest picked, for the checkout that follows "Book now". */
export type GuestBookingDetails = {
  /** The same request POST /bookings/ takes, without the key. */
  selection: PricingSelection;
  guideId: string;
  /** "Tuesday, September 12 at 7:30 AM", or the chosen day when unscheduled. */
  when: string;
  guests: number;
  /** "1 Adult", or "3 guests" across several ticket types. */
  ticketsLabel: string;
  /** The server's total when the quote loaded; otherwise a price-list estimate. */
  total: string;
  currency: string;
  durationLabel: string;
  /** The guest chose from several times on that day, so the checkout can say "see the time slots". */
  hasTimeSlots: boolean;
  /** "Full refund until Fri 4 December, 9:00am", for the checkout summary. */
  cancellationNote: string;
};

export type BookingPanelViewModel = Omit<TicketSelection, "guests" | "picked"> & {
  durationLabel: string;
  /** The experience's cancellation policy, or null when it has none. */
  cancellationPolicy: string | null;
  sessions: SessionChoice;
  promo: {
    input: string;
    onInputChange: (value: string) => void;
    onApply: () => void;
    message: { text: string; ok: boolean } | null;
  };
  /** Set once the selection is priced; `updating` while a new price is on its way. */
  quote: { updating: boolean } | null;
  quoteError: string | null;
  /** The chosen session has fewer seats left than the guests picked. */
  seatsWarning: string | null;
  /** Null until the selection can be booked and is priced. */
  total: string | null;
  /** The list-price total, shown the instant a ticket is added while the server's quote is still on its way. Null when nothing can be booked. */
  totalEstimate: string | null;
  /** The server is pricing the latest selection. */
  totalUpdating: boolean;
  booking: { available: boolean; disabled: boolean; pending: boolean; label: string; onBook: () => void };
  card: BookingCardState;
};

/** What the redesigned card shows beyond the pickers themselves. */
export type BookingCardState = {
  /** "₦16,000 per person", or "From ₦16,000" when ticket types differ. */
  headline: { showFrom: boolean; amount: string; unit: string; was: string | null; pill: string | null };
  /** Lines under the headline: when an early-bird price ends. */
  notes: string[];
  /** The few rows above the total: add-ons and what a group or promo code saved. */
  breakdown: BreakdownRow[];
  /** "Sat 12 September · 2.5 hours". */
  dateField: string;
  /** Inputs are frozen while a booking starts. */
  locked: boolean;
  notice: {
    tone: "neutral" | "error";
    title: string;
    body: string;
    action: { label: string; kind: "dates" | "retry" } | null;
  } | null;
  onRetry: () => void;
  /** The amount when something real is picked, otherwise what is missing. */
  total: { amount: string | null; muted: string | null; fees: string };
  button: { label: string | null; loading: boolean; disabled: boolean; onClick: () => void };
  /** Every experience says the same line under the button; its own policy, when it has one, is in the tooltip. */
  cancellation: { title: string; body: string; hint: string | null };
};

/** What the trip costs: the quote's total without the processing fee, which
 * is added at checkout. */
function tripTotal(quote: Quote): number {
  const fees = quote.lines.filter((line) => line.kind === "fee").reduce((sum, line) => sum + Number(line.amount), 0);
  return Number(quote.total) - fees;
}

export function useBookingPanelViewModel({
  experienceId,
  guideId,
  prices,
  currency,
  durationLabel,
  eventStartDate,
  availableSpots,
  minSpots = 1,
  cancellationPolicy,
  refundPolicy,
  freeCancellationHours,
  onGuestBook,
}: BookingPanelProps): BookingPanelViewModel {
  const minGuests = Math.max(1, minSpots ?? 1);
  const router = useRouter();
  const { data: pricing } = useExperiencePricing(experienceId);
  const sessionsQuery = useExperienceSessions(experienceId);
  const sessions = useSessionChoice(sessionsQuery.data, eventStartDate, sessionsQuery.isLoading);
  // No more guests than the chosen session has seats for.
  const seatsLeft = sessions.session?.seats_left ?? null;
  const maxGuests = Math.min(availableSpots ?? 10, seatsLeft ?? Infinity);
  const { guests, picked, ...ticketSelection } = useTicketSelection({
    pricing,
    fallbackPrices: prices,
    currency,
    minGuests,
    maxGuests,
    // A scheduled session's length is set by the schedule.
    daysFixed: sessions.scheduled,
  });
  const createBooking = useCreateBooking();
  const bookingAttemptKey = useRef<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Outside the group size nothing can be booked, so nothing is priced.
  const withinGroupSize = guests >= minGuests && guests <= maxGuests;
  const requestKey = JSON.stringify(sessions.request);
  const pickedKey = JSON.stringify(picked);
  const selection: PricingSelection | null = useMemo(
    () =>
      picked.items.length === 0 || !withinGroupSize
        ? null
        : {
            experience_id: experienceId,
            ...picked,
            ...sessions.request,
            promo_code: appliedPromo ?? undefined,
          },
    // `picked` and `request` are rebuilt every render; their JSON is the
    // stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experienceId, pickedKey, requestKey, appliedPromo, withinGroupSize],
  );
  const { data: lastQuote, isFetching: quoting, isError: quoteFailed, error: quoteErrorCause, refetch: retryQuote } = useBookingQuote(selection);
  // The query keeps the previous quote while a new one loads; drop it once
  // there's nothing to price, so no stale total is shown.
  const quote = selection ? lastQuote : undefined;
  const selectionKey = JSON.stringify(selection);

  // A different selection is a new booking attempt with its own key.
  useEffect(() => {
    bookingAttemptKey.current = null;
  }, [selectionKey]);

  // The server counts guests (tickets per booking count once); trust it.
  const quotedGuests = quote?.guests ?? guests;
  // A guest isn't booking yet, so a missing or failed quote doesn't block them.
  const isReady =
    !!sessions.request &&
    !!selection &&
    quotedGuests >= minGuests &&
    quotedGuests <= maxGuests &&
    (!!onGuestBook || (!!quote && !quoteFailed));
  const total = quote ? shortPriceOrFree(tripTotal(quote), currency) : null;
  const free = !!quote && tripTotal(quote) === 0;
  const soldOutDay = sessions.dayStatus === "soldout";
  const terms = cancellationTerms({
    refundPolicy,
    freeCancellationHours,
    sessionStartsAt: sessions.session?.starts_at ?? null,
    timeZone: sessionsQuery.data?.timezone,
  });

  const bookLabel = () => {
    if (createBooking.isPending) return "Starting checkout…";
    if (guests < minGuests) return `Select at least ${minGuests} guests`;
    if (guests > maxGuests) return `Select up to ${maxGuests} guest${maxGuests === 1 ? "" : "s"}`;
    if (free) return "Book for free";
    return total ? `Book now - ${total}` : "Book now";
  };

  // Unscheduled experiences have no real start time yet: the host confirms it.
  const quoteWhen = (q: { session_starts_at?: string | null; session_ends_at?: string | null; timezone?: string | null }) => {
    if (!q.session_starts_at) return null;
    return sessions.scheduled
      ? formatSessionWhen(q.session_starts_at, q.session_ends_at, q.timezone ?? undefined)
      : formatSessionDay(q.session_starts_at, q.timezone ?? undefined);
  };
  const guestWhen = () => {
    const session = sessions.session;
    const fromQuote = quote ? quoteWhen(quote) : null;
    if (fromQuote) return fromQuote;
    if (session) return formatSessionWhen(session.starts_at, session.ends_at, sessionsQuery.data?.timezone);
    return sessions.dateLabel;
  };
  const ticketsLabel = () => {
    if (picked.items.length !== 1) return `${quotedGuests} guests`;
    const item = picked.items[0];
    const label = (pricing?.prices ?? prices).find((price) => price.id === item.experience_price_id)?.label;
    return `${item.quantity} ${label ?? "ticket"}`;
  };
  // Until a guest can be quoted, the list prices give a total to show.
  const estimateTotal = () => {
    const list = pricing?.prices ?? [];
    const days = picked.days ?? 1;
    return picked.items.reduce((sum, item) => {
      const price = list.find((p) => p.id === item.experience_price_id) ?? prices.find((p) => p.id === item.experience_price_id);
      if (!price) return sum;
      const unit = "pricing_unit" in price ? price.pricing_unit : "per_person";
      const quantity = unit === "per_booking" ? 1 : unit === "per_day" ? item.quantity * days : item.quantity;
      return sum + Number(price.amount) * quantity;
    }, 0);
  };

  const onBook = () => {
    if (!guideId || !selection || !isReady) return;
    if (onGuestBook) {
      onGuestBook({
        selection,
        guideId,
        when: guestWhen(),
        guests: quotedGuests,
        ticketsLabel: ticketsLabel(),
        total: total ?? shortPriceOrFree(estimateTotal(), currency),
        currency,
        durationLabel,
        hasTimeSlots: sessions.scheduled && sessions.options.length > 1,
        cancellationNote: terms.short,
      });
      return;
    }
    // One key per booking attempt: re-clicking reuses it, so the server
    // returns the booking it already created instead of a second one.
    bookingAttemptKey.current ??= crypto.randomUUID();
    createBooking.mutate(
      { ...selection, idempotencyKey: bookingAttemptKey.current, guide_id: guideId },
      {
        onSuccess: (booking) => {
          if (booking.url) window.location.href = booking.url;
          // Free experiences are confirmed straight away, with no checkout.
          else router.push(`/bookings/${booking.id}/success`);


        },
        onError: (error) => {
          bookingAttemptKey.current = null;
          // A 409 (the session filled up) reloads the sessions in the model.
          toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
        },
      },
    );
  };

  const noTimeYet = sessions.scheduled && !sessions.session;
  const quoteProblem = quoteFailed && !onGuestBook ? apiErrorMessage(quoteErrorCause, "We couldn't price this selection. Please adjust it and try again.") : null;
  const liveTotal = total ?? (selection && sessions.request ? shortPrice(estimateTotal(), currency) : null);
  const jumpLabel = sessions.nextOpen ? `Jump to ${sessions.nextOpen.shortLabel}` : null;
  const showDates = sessions.selectedDate ? shortDay(dateKey(sessions.selectedDate)) : "";
  const notice: BookingCardState["notice"] = quoteProblem
    ? { tone: "error", title: "We couldn't price this selection", body: `${quoteProblem} Nothing has been booked or charged.`, action: { label: "Try again", kind: "retry" } }
    : soldOutDay
      ? {
          tone: "neutral",
          title: `Sold out on ${showDates}`,
          body: sessions.nextOpen ? `Next available: ${sessions.nextOpen.label}.` : "Nothing else is open right now.",
          action: { label: "See all dates", kind: "dates" },
        }
      : null;
  const bookDisabled = !isReady || (quoting && !onGuestBook) || createBooking.isPending;
  const rules = pricing?.rules ?? [];
  const group = quote ? groupHeadline(quote.lines, quote.savings, rules, currency) : null;
  // Experiences have no early bird any more (events get it as a ticket phase).
  const priceNow = group;
  // A multi-day session sold per person says so in the headline: "per person, all 3 days".
  const unit =
    sessions.scheduled && sessions.lengthDays > 1 && ticketSelection.priceFrom.unitWords === "per person"
      ? `per person, all ${sessions.lengthDays} days`
      : ticketSelection.priceFrom.unitWords;
  const card: BookingCardState = {
    headline: {
      showFrom: ticketSelection.priceFrom.showFrom && !priceNow,
      amount: priceNow?.amount ?? ticketSelection.priceFrom.amount,
      unit,
      was: priceNow?.was ?? null,
      pill: priceNow?.pill ?? null,
    },
    notes: [],
    breakdown: quote ? breakdownRows(quote.lines, quote.savings, currency) : [],
    // With one time on the day there is no picker, so the date field carries it: "Sat 12 September · 7:00 AM · 2.5 hours".
    dateField: [sessions.fieldLabel, sessions.singleTime ? sessions.options[0]?.label : null, sessions.selectedDate ? durationLabel : null]
      .filter(Boolean)
      .join(" · "),
    locked: createBooking.isPending,
    notice,
    onRetry: () => void retryQuote(),
    total: {
      amount: soldOutDay || noTimeYet || guests < minGuests ? null : liveTotal,
      muted:
        soldOutDay || sessions.dayStatus === "empty"
          ? "Pick another date"
          : noTimeYet
            ? "Select a time"
            : guests < minGuests
              ? `Needs ${minGuests} guests`
              : liveTotal
                ? null
                : "Select a date",
      // Always true for now; becomes `fees_included` / `tax_percent` (booking card spec 3.4).
      fees: "Fees and taxes included",
    },
    button:
      soldOutDay && jumpLabel
        ? { label: jumpLabel, loading: false, disabled: false, onClick: sessions.onJumpToNext }
        : { label: free ? "Book for free" : "Book now", loading: createBooking.isPending, disabled: bookDisabled, onClick: onBook },
    cancellation: {
      title: "Cancellation",
      body: terms.body,
      hint: cancellationPolicy?.trim() || null,
    },
  };

  return {
    ...ticketSelection,
    durationLabel,
    cancellationPolicy: cancellationPolicy?.trim() || null,
    sessions,
    promo: {
      input: promoInput,
      onInputChange: setPromoInput,
      onApply: () => setAppliedPromo(promoInput.trim() || null),
      message:
        appliedPromo && quote
          ? quote.promo_applied
            ? { text: `${quote.promo_code} applied`, ok: true }
            : { text: quote.promo_message ?? "", ok: false }
          : null,
    },
    quote: quote ? { updating: quoting } : null,
    quoteError: quoteProblem,
    seatsWarning:
      seatsLeft !== null && guests > seatsLeft
        ? `Only ${seatsLeft} spot${seatsLeft === 1 ? "" : "s"} left for this session.`
        : null,
    total,
    totalEstimate: selection ? trimWholeAmount(formatPrice(estimateTotal(), currency)) : null,
    totalUpdating: !!selection && quoting,
    card,
    booking: {
      available: !!guideId,
      disabled: bookDisabled,
      pending: createBooking.isPending,
      label: bookLabel(),
      onBook,
    },
  };
}
