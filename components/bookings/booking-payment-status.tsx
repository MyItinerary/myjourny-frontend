"use client";

import { useEffect, useState } from "react";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";
import { useSession } from "@/lib/auth/session-store";
import {
  bookingPaymentState,
  PROCESSING_TIMEOUT_MS,
  useBooking,
  useRetryBookingPayment,
} from "@/lib/queries/bookings";

type Props = {
  bookingId: string;
  // Which itin redirect brought the customer here; only used when the
  // booking can't be loaded (e.g. signed out).
  landedFrom: "success" | "cancel";
};

// Shown after checkout. itin's redirect only says where the customer came
// back from; the booking's payment_status (set by the provider's webhook) is
// what decides whether it's confirmed. Polls while the payment is processing.
export function BookingPaymentStatus({ bookingId, landedFrom }: Props) {
  const { user } = useSession();
  const [pollUntil] = useState(() => Date.now() + PROCESSING_TIMEOUT_MS);
  const [timedOut, setTimedOut] = useState(false);
  const { data: booking, isLoading, isError } = useBooking(bookingId, { pollUntil });
  const retry = useRetryBookingPayment();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), PROCESSING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!user || isError) {
    return landedFrom === "success" ? (
      <InterstitialScreen
        heading="Thanks — we're confirming your payment"
        subtitle="We'll email you as soon as your booking is confirmed. There's no need to pay again."
        primaryLabel="Back to home"
        primaryHref="/"
        illustration={null}
      />
    ) : (
      <InterstitialScreen
        heading="Payment not completed"
        subtitle="No charge was made. Sign in and open your booking to try paying again."
        primaryLabel="Back to home"
        primaryHref="/"
        illustration={null}
      />
    );
  }

  if (isLoading || !booking) {
    return (
      <InterstitialScreen
        heading="Checking your payment…"
        subtitle="This only takes a moment."
        primaryLabel="Back to home"
        primaryHref="/"
        illustration={null}
      />
    );
  }

  switch (bookingPaymentState(booking)) {
    case "confirmed":
      return (
        <InterstitialScreen
          heading="Booking confirmed 🎉"
          subtitle="You're all set — we've sent the details to your email. See you there!"
          primaryLabel="View booking"
          primaryHref={`/bookings/${booking.id}`}
          secondaryLabel="Back to home"
          secondaryHref="/"
          illustration={null}
        />
      );
    case "cancelled":
      return (
        <InterstitialScreen
          heading="Booking cancelled"
          subtitle="This booking was cancelled. Any refund agreed with our support team is on its way."
          primaryLabel="View booking"
          primaryHref={`/bookings/${booking.id}`}
          secondaryLabel="Back to home"
          secondaryHref="/"
          illustration={null}
        />
      );
    case "processing":
      return timedOut ? (
        <InterstitialScreen
          heading="Your payment is still processing"
          subtitle="We'll email you as soon as it's confirmed. There's no need to pay again."
          primaryLabel="Back to home"
          primaryHref="/"
          illustration={null}
        />
      ) : (
        <InterstitialScreen
          heading="Confirming your payment…"
          subtitle="This usually takes a few seconds. Please don't close this page or pay again."
          primaryLabel="Back to home"
          primaryHref="/"
          illustration={null}
        />
      );
    case "not_paid":
      return (
        <InterstitialScreen
          heading="Payment not completed"
          subtitle="No charge was made. Your booking details are saved — you can try paying again."
          primaryLabel={retry.isPending ? "Opening checkout…" : "Try payment again"}
          primaryOnClick={() => retry.mutate(booking.id)}
          primaryDisabled={retry.isPending}
          secondaryLabel="Back to home"
          secondaryHref="/"
          illustration={null}
        />
      );
    case "under_review":
      return (
        <InterstitialScreen
          heading="We're sorting this out"
          subtitle="Your payment came through, but this date filled up before it was confirmed. Our support team will refund you and email you shortly."
          primaryLabel="Back to home"
          primaryHref="/"
          illustration={null}
        />
      );
    case "refunded":
      return (
        <InterstitialScreen
          heading="Booking refunded"
          subtitle="This booking has been refunded. The money should reach your account within a few working days."
          primaryLabel="Back to home"
          primaryHref="/"
          illustration={null}
        />
      );
  }
}
