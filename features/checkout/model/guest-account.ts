import { useGoogleAuth, useRegister } from "@/lib/queries/auth";

/** Creates the guest's account (email and password) when they confirm and pay. */
export function useGuestRegister() {
  return useRegister();
}

/** Signs in (or up) with a Google credential. */
export function useGuestGoogleSignup() {
  return useGoogleAuth();
}

/** Whether a failed sign-up was because the email already has an account. */
export function isEmailTakenError(error: unknown): boolean {
  const detail = (error as { response?: { data?: { detail?: unknown } } } | null)?.response?.data?.detail;
  return typeof detail === "string" && /already registered/i.test(detail);
}
