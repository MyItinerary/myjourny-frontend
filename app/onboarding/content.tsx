"use client";

import { useState } from "react";

import { AuthForm } from "@/components/onboarding/auth-form";
import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";

// Figma: "Desktop - 1" (2068:24661) / "Splash" (2068:25512) for the initial
// state, "Desktop - 27" (2068:24874) / "Splash" (2068:25697) for the email
// state. Previously two separate routes (/onboarding and /onboarding/email)
// asking for the same email field back to back — merged into one screen
// that swaps its heading/subtitle the moment the email input is focused,
// instead of a second full navigation for the same field.
export function OnboardingContent() {
  const [isEnteringEmail, setIsEnteringEmail] = useState(false);

  return (
    <AuthScreenLayout
      heading={isEnteringEmail ? "What's your Email Address?" : "Start experiencing life your way"}
      subtitle={
        isEnteringEmail
          ? "You will need this when trying to Log in"
          : "Create an account to find experiences curated around you."
      }
    >
      <AuthForm
        continueHref="/onboarding/password"
        emailPlaceholder={isEnteringEmail ? "mail@example.com" : "Enter email address"}
        onEmailFocus={() => setIsEnteringEmail(true)}
        onEmailSubmit={(email) => `/onboarding/password?email=${encodeURIComponent(email)}`}
      />
    </AuthScreenLayout>
  );
}
