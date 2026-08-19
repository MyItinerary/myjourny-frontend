"use client";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { PasswordForm } from "@/components/onboarding/password-form";

// Figma: "Desktop - 28"/"Desktop - 29" (2068:24915/2068:24962) / "Splash" (2068:25734/2068:25773)
export function PasswordContent() {
  return (
    <AuthScreenLayout
      heading="Create a secure Password"
      subtitle="You'll use your password to Log in to your account later"
    >
      <PasswordForm
        continueHref="/onboarding/get-to-know-you"
        bottomLink={{ prompt: "Already have an account?", linkText: "Login", href: "/login" }}
      />
    </AuthScreenLayout>
  );
}
