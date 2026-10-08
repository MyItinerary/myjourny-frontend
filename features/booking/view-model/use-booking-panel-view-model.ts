import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { apiErrorMessage } from "@/lib/api-error";

import type { PricingSelection } from "../model/booking.types";
import { useCreateBooking } from "../model/bookings";
import { formatPrice } from "../model/format";
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
};

export type BookingPanelViewModel = Omit<TicketSelection, "guests" | "picked"> & {
  durationLabel: string;
  sessions: SessionChoice;
  promo: {
    input: string;
    onInputChange: (value: string) => void;
    onApply: () => void;
    message: { text: string; ok: boolean } | null;
  };
  quote: { lines: { key: string; label: string; amount: string; isDiscount: boolean }[]; updating: boolean } | null;
  quoteError: string | null;
  /** The chosen session has fewer seats left than the guests picked. */
  seatsWarning: string | null;
  total: string;
  booking: { available: boolean; disabled: boolean; pending: boolean; label: string; onBook: () => void };
};

export function useBookingPanelViewModel({
  experienceId,
  guideId,
  prices,
  currency,
  durationLabel,
  eventStartDate,
  availableSpots,
  minSpots = 1,
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
  });
  const createBooking = useCreateBooking();
  const bookingAttemptKey = useRef<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const { requestedDatetime } = sessions;
  const pickedKey = JSON.stringify(picked);
  const selection: PricingSelection | null = useMemo(
    () =>
      picked.items.length === 0
        ? null
        : {
            experience_id: experienceId,
            ...picked,
            requested_datetime: requestedDatetime ?? undefined,
            promo_code: appliedPromo ?? undefined,
          },
    // `picked` is rebuilt every render; its JSON is the stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [experienceId, pickedKey, requestedDatetime, appliedPromo],
  );
  const { data: quote, isFetching: quoting, isError: quoteFailed, error: quoteErrorCause } = useBookingQuote(selection);
  const selectionKey = JSON.stringify(selection);

  // A different selection is a new booking attempt with its own key.
  useEffect(() => {
    bookingAttemptKey.current = null;
  }, [selectionKey]);

  // The server counts guests (tickets per booking count once); trust it.
  const quotedGuests = quote?.guests ?? guests;
  const isReady =
    !!requestedDatetime &&
    !!selection &&
    quotedGuests >= minGuests &&
    quotedGuests <= maxGuests &&
    !!quote &&
    !quoteFailed;
  const total = formatPrice(quote ? Number(quote.total) : 0, currency);

  const onBook = () => {
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
          lines: quote.lines.map((line, index) => ({
            key: `${line.kind}-${index}`,
            label:
              line.label +
              (line.kind !== "discount" && line.kind !== "fee" && line.quantity > 1 ? ` × ${line.quantity}` : ""),
            amount: formatPrice(Number(line.amount), currency),
            isDiscount: line.kind === "discount",
          })),
        }
      : null,
    quoteError: quoteFailed
      ? apiErrorMessage(quoteErrorCause, "We couldn't price this selection. Please adjust it and try again.")
      : null,
    seatsWarning:
      seatsLeft !== null && guests > seatsLeft
        ? `Only ${seatsLeft} spot${seatsLeft === 1 ? "" : "s"} left for this session.`
        : null,
    total,
    booking: {
      available: !!guideId,
      disabled: !isReady || quoting || createBooking.isPending,
      pending: createBooking.isPending,
      label: createBooking.isPending ? "Starting checkout…" : `Book now - ${total}`,
      onBook,
    },
  };
}
