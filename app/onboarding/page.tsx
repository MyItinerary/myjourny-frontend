import type { Metadata } from "next";

import { OnboardingContent } from "./content";

export const metadata: Metadata = {
  title: "Sign up — MyJourny",
};

// Figma: "Desktop - 1" (2068:24661) / "Splash" (2068:25512)
export default function OnboardingPage() {
  return <OnboardingContent />;
}
