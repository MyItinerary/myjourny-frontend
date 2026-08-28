import type { Metadata } from "next";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";

export const metadata: Metadata = {
  title: "Booking cancelled — MyJourny",
};

// Landed on after itin's /bookings/cancel marks the booking cancelled and
// redirects here (platform=web) instead of returning raw JSON.
export default function BookingCancelPage() {
  return (
    <InterstitialScreen
      heading="Booking cancelled"
      subtitle="No charge was made. You can pick a new date and try again whenever you're ready."
      primaryLabel="Back to home"
      primaryHref="/"
      illustration={null}
    />
  );
}
