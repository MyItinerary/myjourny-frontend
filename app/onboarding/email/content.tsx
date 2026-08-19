"use client";

import { AuthForm } from "@/components/onboarding/auth-form";
import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";

// Figma: "Desktop - 27" (2068:24874) / "Splash" (2068:25697)
export function EmailContent() {
  return (
    <AuthScreenLayout
      heading="What's your Email Address?"
      subtitle="You will need this when trying to Log in"
    >
      <AuthForm continueHref="/onboarding/password" emailPlaceholder="mail@example.com" />
    </AuthScreenLayout>
  );
}
