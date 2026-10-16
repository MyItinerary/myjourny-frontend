import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { isTwoFactorChallenge, useGoogleAuth, useLogin, useRegister } from "@/lib/queries/auth";

import type { EmailLookup } from "./guest-account.types";

/** Creates the account (email and password) for someone new. */
export function useGuestRegister() {
  return useRegister();
}

/** Signs in (or up) with a Google credential. */
export function useGuestGoogleSignup() {
  return useGoogleAuth();
}

/** Logs in someone whose email already has an account. */
export function useGuestLogin() {
  return useLogin();
}

/** Login and Google answer with this, not tokens, until a 2FA code is sent. */
export { isTwoFactorChallenge };

/** Whether a failed sign-up was because the email already has an account. */
export function isEmailTakenError(error: unknown): boolean {
  const detail = (error as { response?: { data?: { detail?: unknown } } } | null)?.response?.data?.detail;
  return typeof detail === "string" && /already registered/i.test(detail);
}

export const EMAIL_LOOKUP_PATH = "/auth/email-exists";

/** Whether an email already has an account, and whether it has a password
 * (one made with Google has none). Null when the lookup fails: the person is
 * then treated as new, and sign-up's "already registered" catches a mistake. */
export function useEmailLookup() {
  return useMutation({
    mutationFn: async (email: string): Promise<EmailLookup | null> => {
      try {
        const { data } = await apiClient.post<{ exists?: boolean; has_password?: boolean }>(EMAIL_LOOKUP_PATH, {
          email,
        });
        return { exists: data.exists === true, hasPassword: data.has_password === true };
      } catch {
        return null;
      }
    },
  });
}
