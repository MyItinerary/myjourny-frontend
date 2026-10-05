import type { Metadata } from "next";

import { BookingPaymentStatus } from "@/components/bookings/booking-payment-status";

export const metadata: Metadata = {
  title: "Your booking — MyJourny",
};

// Landed on after itin's /bookings/success redirect (platform=web). The
// redirect doesn't prove payment: the page reads the booking's
// payment_status and waits for the provider's webhook if it hasn't landed.
export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingPaymentStatus bookingId={id} landedFrom="success" />;
}
