import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import type { PricingSelection, Quote } from "../model/booking.types";
import { useCreateBooking } from "../model/bookings";
import { formatPrice, formatSessionWhen, type ScheduleSummary, scheduleLabel } from "../model/format";
import { useBookingQuote, useExperiencePricing } from "../model/pricing";
import { useExperienceSessions } from "../model/sessions";
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
  /** The experience's schedule, for a label like "Every Saturday · 3 days". */
  schedule?: ScheduleSummary;
  /** Set for guests: they pick tickets and a date like anyone else, and
   * "Book now" sends them here instead of creating a booking. */
  guestHref?: string;
};

export type BookingPanelViewModel = Omit<TicketSelection, "guests" | "picked"> & {
  durationLabel: string;
  /** "Every Saturday · 3 days"; null without a schedule. */
  scheduleLabel: string | null;
  /** "Each booking covers all 3 days." when the schedule fixes the length. */
  lengthNote: string | null;
  sessions: SessionChoice;
  promo: {
    input: string;
    onInputChange: (value: string) => void;
    onApply: () => void;
    message: { text: string; ok: boolean } | null;
  };
  quote: {
    lines: SummaryLine[];
    /** "You save ₦1,200.00" when any discount applies. */
    savings: string | null;
    updating: boolean;
    /** When the quoted session runs, in its own zone (a range if multi-day). */
    when: string | null;
  } | null;
  quoteError: string | null;
  /** The chosen session has fewer seats left than the guests picked. */
  seatsWarning: string | null;
  /** Null until the selection can be booked and is priced. */
  total: string | null;
  booking: { available: boolean; disabled: boolean; pending: boolean; label: string; onBook: () => void };
};

export type SummaryLine = {
  key: string;
  label: string;
  amount: string;
  /** The price before early-bird, shown struck through. */
  listAmount?: string | null;
  kind: "item" | "subtotal" | "discount" | "fee";
};

/** The quote as summary rows: tickets and add-ons (with their pre-early-bird
 * price), then the subtotal and each discount when there are any, then the fee. */
function summaryLines(quote: Quote, currency: string): SummaryLine[] {
  const money = (amount: number | string) => formatPrice(Number(amount), currency);
  const items: SummaryLine[] = quote.lines
    .filter((line) => line.kind === "ticket" || line.kind === "addon")
    .map((line, index) => ({
      key: `${line.kind}-${index}`,
      label: line.label + (line.quantity > 1 ? ` × ${line.quantity}` : ""),
      amount: money(line.amount),
      listAmount: line.list_amount != null ? money(line.list_amount) : null,
      kind: "item",
    }));
  const fees: SummaryLine[] = quote.lines
    .filter((line) => line.kind === "fee")
    .map((line, index) => ({ key: `fee-${index}`, label: line.label, amount: money(line.amount), kind: "fee" }));
  // Older servers don't list savings; their discount lines say enough.
  const savings = quote.savings;
  const discounts: SummaryLine[] = savings
    ? savings.map((saving, index) => ({
        key: `saving-${index}`,
        label: saving.label,
        amount: `−${money(saving.amount)}`,
        kind: "discount",
      }))
    : quote.lines
        .filter((line) => line.kind === "discount")
        .map((line, index) => ({ key: `discount-${index}`, label: line.label, amount: money(line.amount), kind: "discount" }));
  if (discounts.length === 0) return [...items, ...fees];
  const subtotal: SummaryLine = {
    key: "subtotal",
    label: "Subtotal",
    amount: money(quote.subtotal_before_discounts ?? quote.subtotal),
    kind: "subtotal",
  };
  return [...items, subtotal, ...discounts, ...fees];
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
  schedule,
  guestHref,
}: BookingPanelProps): BookingPanelViewModel {
  const minGuests = Math.max(1, minSpots ?? 1);
  const router = useRouter();
  const { data: pricing } = useExperiencePricing(experienceId);
  const sessionsQuery = useExperienceSessions(experienceId);
  const sessions = useSessionChoice(sessionsQuery.data, eventStartDate);
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
  const { data: lastQuote, isFetching: quoting, isError: quoteFailed, error: quoteErrorCause } = useBookingQuote(selection);
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
    (!!guestHref || (!!quote && !quoteFailed));
  const total = quote ? formatPrice(Number(quote.total), currency) : null;
  const savedAmount = (quote?.savings ?? []).reduce((sum, saving) => sum + Number(saving.amount), 0);
  const bookLabel = () => {
    if (createBooking.isPending) return "Starting checkout…";
    if (guests < minGuests) return `Select at least ${minGuests} guests`;
    if (guests > maxGuests) return `Select up to ${maxGuests} guest${maxGuests === 1 ? "" : "s"}`;
    return total ? `Book now - ${total}` : "Book now";
  };

  const onBook = () => {
    if (!guideId || !selection || !isReady) return;
    if (guestHref) {
      router.push(guestHref);
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
          else if (booking.status === "confirmed") router.push(`/bookings/${booking.id}/success`);
          // Anything else (e.g. awaiting payment with no link yet) has its page.
          else router.push(`/bookings/${booking.id}`);
        },
        onError: (error) => {
          bookingAttemptKey.current = null;
          // 409: the session filled up or stopped running. Show fresh seats.
          if ((error as { response?: { status?: number } })?.response?.status === 409) {
            void sessionsQuery.refetch();
          }
          toast.error(apiErrorMessage(error, "Couldn't start your booking. Please try again."));
        },
      },
    );
  };

  return {
    ...ticketSelection,
    durationLabel,
    scheduleLabel: schedule ? scheduleLabel(schedule) : null,
    lengthNote:
      sessions.scheduled && sessions.lengthDays > 1
        ? `Each booking covers all ${sessions.lengthDays} days.`
        : null,
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
    quote: quote
      ? {
          updating: quoting,
          when: quote.session_starts_at
            ? formatSessionWhen(quote.session_starts_at, quote.session_ends_at, quote.timezone ?? undefined)
            : null,
          lines: summaryLines(quote, currency),
          savings: savedAmount > 0 ? `You save ${formatPrice(savedAmount, currency)}` : null,
        }
      : null,
    quoteError: quoteFailed && !guestHref
      ? apiErrorMessage(quoteErrorCause, "We couldn't price this selection. Please adjust it and try again.")
      : null,
    seatsWarning:
      seatsLeft !== null && guests > seatsLeft
        ? `Only ${seatsLeft} spot${seatsLeft === 1 ? "" : "s"} left for this session.`
        : null,
    total,
    booking: {
      available: !!guideId,
      disabled: !isReady || (quoting && !guestHref) || createBooking.isPending,
      pending: createBooking.isPending,
      label: bookLabel(),
      onBook,
    },
  };
}
