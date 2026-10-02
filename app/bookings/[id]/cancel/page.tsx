import type { Metadata } from "next";

import { BookingPaymentStatus } from "@/components/bookings/booking-payment-status";

export const metadata: Metadata = {
  title: "Your booking — MyJourny",
};

// Landed on when the customer leaves checkout or the payment fails (itin's
// /bookings/cancel, or /bookings/success after a failed Paystack payment).
// Offers to retry the payment for the same booking.
export default async function BookingCancelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingPaymentStatus bookingId={id} landedFrom="cancel" />;
}
