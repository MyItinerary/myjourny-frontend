import type { Metadata } from "next";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";

export const metadata: Metadata = {
  title: "Check your email — MyJourny",
};

// Figma: "Desktop - 34" (2068:24817) — no inputs, no illustration, just a
// text action (not a `Large Buttons` instance in Figma, so implemented as
// plain text, not a pill button).
export default function CheckEmailPage() {
  return (
    <AuthScreenLayout
      heading="Check your email for a reset link"
      subtitle="Please check your email and follow the instructions to reset your password"
    >
      <p className="text-center text-sm text-muted-foreground">
        Didn&rsquo;t receive an email?{" "}
        <button type="button" className="text-brand">
          Resend email
        </button>
      </p>
    </AuthScreenLayout>
  );
}
