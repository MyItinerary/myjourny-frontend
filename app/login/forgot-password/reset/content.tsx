"use client";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { PasswordForm } from "@/components/onboarding/password-form";

// Figma: "Desktop - 35"/"Desktop - 36" (2068:24939/2068:24986)
export function ResetPasswordContent() {
  return (
    <AuthScreenLayout
      heading="Create a secure Password"
      subtitle="Enter a new password, make sure to not lose this one"
    >
      <PasswordForm
        continueHref="/login/forgot-password/success"
        bottomLink={{
          prompt: "Not looking to reset your password?",
          linkText: "Back to login",
          href: "/login",
        }}
      />
    </AuthScreenLayout>
  );
}
