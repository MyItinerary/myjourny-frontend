import type { Metadata } from "next";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";

export const metadata: Metadata = {
  title: "Booking confirmed — MyJourny",
};

// Landed on after itin's /bookings/success verifies payment and redirects
// here (platform=web) instead of the mobile app's myjourny:// deep link.
// No fetch needed — verification already happened server-side before the
// redirect. Reuses the onboarding InterstitialScreen shell (heading +
// subtitle + CTA) rather than building new confirmation UI from scratch.
export default function BookingSuccessPage() {
  return (
    <InterstitialScreen
      heading="Booking confirmed 🎉"
      subtitle="You're all set — we've sent the details to your email. See you there!"
      primaryLabel="Back to home"
      primaryHref="/"
      illustration={null}
    />
  );
}
