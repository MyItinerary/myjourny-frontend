"use client";

import { useSearchParams } from "next/navigation";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { useRequestPasswordReset } from "@/lib/queries/auth";

// Figma: "Desktop - 34" (2068:24817) — no inputs, no illustration, just a
// text action (not a `Large Buttons` instance in Figma, so implemented as
// plain text, not a pill button).
export function CheckEmailContent() {
  const email = useSearchParams().get("email");
  const requestReset = useRequestPasswordReset();

  return (
    <AuthScreenLayout
      heading="Check your email for a reset link"
      subtitle="Please check your email and follow the instructions to reset your password"
    >
      <p className="text-center text-sm text-muted-foreground">
        Didn&rsquo;t receive an email?{" "}
        <button
          type="button"
          className="text-brand disabled:opacity-50"
          disabled={!email || requestReset.isPending}
          onClick={() => email && requestReset.mutate({ email })}
        >
          {requestReset.isSuccess ? "Email sent" : "Resend email"}
        </button>
      </p>
    </AuthScreenLayout>
  );
}
