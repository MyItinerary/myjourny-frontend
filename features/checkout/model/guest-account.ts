import { useQuery, useQueryClient } from "@tanstack/react-query";

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

// POST { email } -> { exists, has_password } (itin#98). Rate limited to 20
// lookups per IP per 10 minutes, so it is called once per finished email, not
// while typing. If it fails, checkout treats the email as new, and the
// "already registered" error at sign-up still catches an existing account.
export const EMAIL_LOOKUP_PATH = "/auth/email-exists";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalize = (email: string) => email.trim().toLowerCase();

const emailLookup = (email: string) => ({
  queryKey: ["auth", "email-exists", email],
  queryFn: async () => {
    try {
      const { data } = await apiClient.post<{ exists?: boolean }>(EMAIL_LOOKUP_PATH, { email });
      return data.exists === true;
    } catch {
      return false;
    }
  },
  staleTime: 60_000,
});

/** Whether an email already has an account. Pass the email once they have
 * finished typing it; `checking` is true while the answer is pending.
 * `check` asks about any email, reusing an answer already fetched. */
export function useEmailHasAccount(email: string): {
  exists: boolean;
  checking: boolean;
  check: (email: string) => Promise<boolean>;
} {
  const queryClient = useQueryClient();
  const normalized = normalize(email);
  const valid = EMAIL_PATTERN.test(normalized);
  const { data, isFetching } = useQuery({ ...emailLookup(normalized), enabled: valid });

  const check = (other: string) => {
    const value = normalize(other);
    return EMAIL_PATTERN.test(value) ? queryClient.fetchQuery(emailLookup(value)) : Promise.resolve(false);
  };

  return { exists: valid && data === true, checking: valid && isFetching, check };
}
