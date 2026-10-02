import type { Metadata } from "next";

import { BookingDetail } from "@/components/bookings/booking-detail";

export const metadata: Metadata = {
  title: "Your booking — MyJourny",
};

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetail bookingId={id} />;
}
