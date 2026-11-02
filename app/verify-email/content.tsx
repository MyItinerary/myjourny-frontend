"use client";

import { useVerifyEmailViewModel, VerifyEmailView } from "@/features/verify-email";

// Opened from the link itin emails after a password signup
// (/verify-email?token=…). Works signed out too: the token is the proof.
export function VerifyEmailContent() {
  const vm = useVerifyEmailViewModel();
  return <VerifyEmailView {...vm} />;
}
