"use client";

import { AuthForm } from "@/components/onboarding/auth-form";
import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";

// Figma: "Desktop - 32"/"Desktop - 33" (2068:24787/2068:24802)
export function ForgotPasswordContent() {
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
      />
    </AuthScreenLayout>
  );
}
