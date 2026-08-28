"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { PasswordForm } from "@/components/onboarding/password-form";
import { useRegister } from "@/lib/queries/auth";

function isDuplicateEmailError(error: unknown) {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data
    ?.detail;
  return typeof detail === "string" && /already registered/i.test(detail);
}

// Figma: "Desktop - 28"/"Desktop - 29" (2068:24915/2068:24962) / "Splash" (2068:25734/2068:25773)
export function PasswordContent() {
  const router = useRouter();
  const email = useSearchParams().get("email");
  const register = useRegister();

  // This screen requires the email collected on the previous step — a
  // direct visit here has nothing to register.
  useEffect(() => {
    if (!email) router.replace("/onboarding");
  }, [email, router]);

  if (!email) return null;

  return (
    <AuthScreenLayout
      heading="Create a secure Password"
      subtitle="You'll use your password to Log in to your account later"
    >
      <PasswordForm
        continueHref="/onboarding/get-to-know-you"
        bottomLink={{ prompt: "Already have an account?", linkText: "Login", href: "/login" }}
        onSubmit={async ({ password }) => {
          try {
            await register.mutateAsync({ email, password });
            return true;
          } catch {
            return false;
          }
        }}
      />

      {isDuplicateEmailError(register.error) && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-brand">
            Log in instead
          </Link>
        </p>
      )}
    </AuthScreenLayout>
  );
}
