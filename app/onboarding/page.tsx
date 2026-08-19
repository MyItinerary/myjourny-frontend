import type { Metadata } from "next";

import { AuthForm } from "@/components/onboarding/auth-form";
import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";

export const metadata: Metadata = {
  title: "Sign up — MyJourny",
};

// Figma: "Desktop - 1" (2068:24661) / "Splash" (2068:25512)
export default function OnboardingPage() {
  return (
    <AuthScreenLayout
      heading="Start experiencing life your way"
      subtitle="Create an account to find experiences curated around you."
    >
      <AuthForm continueHref="/onboarding/email" />
    </AuthScreenLayout>
  );
}
