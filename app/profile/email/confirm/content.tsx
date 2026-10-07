"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthScreenLayout } from "@/components/onboarding/auth-screen-layout";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";
import { useConfirmEmailChange } from "@/lib/queries/profile";

// Opened from the link itin emails to the new address after an email change
// in Personal information (/profile/email/confirm?token=…). Works signed out
// too: the token is the proof.
export function ConfirmEmailContent() {
  const token = useSearchParams().get("token");
  const { user } = useSession();
  const confirm = useConfirmEmailChange();
  const sent = useRef(false);

  useEffect(() => {
    // Once only, even when effects run twice in development.
    if (!token || sent.current) return;
    sent.current = true;
    confirm.mutate(token);
  }, [token, confirm]);

  const done = confirm.isSuccess;
  const failed = !token || confirm.isError;

  return (
    <AuthScreenLayout
      heading={done ? "Email updated" : failed ? "This link didn't work" : "Confirming your email…"}
      subtitle={
        done
          ? "You'll use your new address to sign in from now on."
          : failed
            ? token
              ? apiErrorMessage(confirm.error, "The link may have expired. Request a new one from your account settings.")
              : "The link is missing its code. Open it straight from the email we sent."
            : "This only takes a moment."
      }
    >
      {(done || failed) && (
        <Button size="cta" className="w-full" render={<Link href={user ? "/profile?tab=personal" : "/login"} />}>
          {user ? "Back to account settings" : "Log in"}
        </Button>
      )}
    </AuthScreenLayout>
  );
}
