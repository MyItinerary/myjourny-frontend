import type { Metadata } from "next";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";

export const metadata: Metadata = {
  title: "Let's get to know you — MyJourny",
};

// Figma: "Desktop - 2" (2068:25022) / "Interstitial" (2068:25821)
export default function GetToKnowYouPage() {
  return (
    <InterstitialScreen
      heading="Let's get to know you better"
      subtitle="Answer a few quick questions so we can curate experiences just for you."
      primaryLabel="Continue"
      primaryHref="/onboarding/pace"
      secondaryLabel="i'll do this later"
      secondaryHref="/"
    />
  );
}
