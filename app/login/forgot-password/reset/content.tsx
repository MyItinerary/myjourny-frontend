"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { PasswordForm } from "@/components/onboarding/password-form";
import { useResetPasswordWithToken } from "@/lib/queries/auth";

// Figma: "Desktop - 35"/"Desktop - 36" (2068:24939/2068:24986). Reached by
// clicking the magic link emailed from the forgot-password request step —
// itin's POST /auth/password/request-reset embeds `?token=...` in that link.
export function ResetPasswordContent() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const resetPassword = useResetPasswordWithToken();

  useEffect(() => {
    if (!token) router.replace("/login/forgot-password");
  }, [token, router]);

  if (!token) return null;

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
        onSubmit={async ({ password }) => {
          try {
            await resetPassword.mutateAsync({ token, new_password: password });
            return true;
          } catch {
            return false;
          }
        }}
      />
    </AuthScreenLayout>
  );
}
