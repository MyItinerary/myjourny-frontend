"use client";

import { AuthForm } from "@/components/onboarding/auth-form";
import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { useRequestPasswordReset } from "@/lib/queries/auth";

// Figma: "Desktop - 32"/"Desktop - 33" (2068:24787/2068:24802)
export function ForgotPasswordContent() {
  const requestReset = useRequestPasswordReset();

  return (
    <AuthScreenLayout
      heading="We all forget sometimes"
      subtitle="Enter your email address and we will send you a link to reset your password"
    >
      <AuthForm
        continueHref="/login/forgot-password/check-email"
        submitLabel="Send reset link"
        showGoogle={false}
        showTerms={false}
        bottomLink={{
          prompt: "Remember your password?",
          linkText: "Back to login",
          href: "/login",
        }}
        onEmailSubmit={async (email) => {
          // Always continue to check-email, matching the backend's
          // intentionally vague response (it never reveals whether the
          // account exists) — a failed request here shouldn't block that.
          await requestReset.mutateAsync({ email }).catch(() => {});
          return `/login/forgot-password/check-email?email=${encodeURIComponent(email)}`;
        }}
      />
    </AuthScreenLayout>
  );
}
