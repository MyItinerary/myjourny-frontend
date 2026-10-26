import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { useGoogleAuth, useLogin, useRegister } from "@/lib/queries/auth";

/** Creates the guest's account (email and password) when they confirm and pay. */
export function useGuestRegister() {
  return useRegister();
}

/** Signs in (or up) with a Google credential. */
export function useGuestGoogleSignup() {
  return useGoogleAuth();
}

/** Logs in a guest whose email already has an account. */
export function useGuestLogin() {
  return useLogin();
}

/** Whether a failed sign-up was because the email already has an account. */
export function isEmailTakenError(error: unknown): boolean {
  const detail = (error as { response?: { data?: { detail?: unknown } } } | null)?.response?.data?.detail;
  return typeof detail === "string" && /already registered/i.test(detail);
}

// itin has no email lookup yet. This is the endpoint checkout will call once
// it does: POST { email } -> { exists: boolean }. Until then (or if it fails)
// checkout treats the email as new, and the "already registered" error at
// sign-up still catches an existing account.
export const EMAIL_LOOKUP_PATH = "/auth/email-exists";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The value, once it has stopped changing for `delayMs`. */
function useDebounced<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}

/** Whether an email already has an account, looked up shortly after they
 * stop typing it. `checking` is true while the answer is pending. */
export function useEmailHasAccount(email: string): { exists: boolean; checking: boolean } {
  const trimmed = email.trim().toLowerCase();
  const settled = useDebounced(trimmed, 400);
  const valid = EMAIL_PATTERN.test(settled);

  const { data, isFetching } = useQuery({
    queryKey: ["auth", "email-exists", settled],
    queryFn: async () => {
      try {
        const { data } = await apiClient.post<{ exists?: boolean }>(EMAIL_LOOKUP_PATH, { email: settled });
        return data.exists === true;
      } catch {
        return false;
      }
    },
    enabled: valid,
    staleTime: 60_000,
  });

  // Typed again since the last settled value: the answer isn't for this email yet.
  const stale = EMAIL_PATTERN.test(trimmed) && trimmed !== settled;
  return { exists: valid && !stale && data === true, checking: stale || (valid && isFetching) };
}
