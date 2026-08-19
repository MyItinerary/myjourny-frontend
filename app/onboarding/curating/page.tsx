import type { Metadata } from "next";

import { InterstitialScreen } from "@/components/onboarding/interstitial-screen";

export const metadata: Metadata = {
  title: "Curating your experiences — MyJourny",
};

// Figma: "Desktop - 13" (2068:25490) / "Interstitial" (2068:25907)
// Note: the mobile frame has a decorative background of scattered category
// chips behind the content — omitted here as a cosmetic-only simplification;
// the logo/illustration/heading/button content (what actually carries
// meaning) is implemented 1:1.
export default function CuratingPage() {
  return (
    <InterstitialScreen
      heading="We're curating your experiences..."
      subtitle="Hang tight while we do our thing"
      primaryLabel="Continue"
      primaryHref="/"
      illustration={
        <div
          aria-hidden
          className="size-[214px] rounded-[30px] border-4 border-[#f5f5f5] bg-[#fafafa]"
        />
      }
    />
  );
}
