"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { setTokens, useSession } from "@/lib/auth/session-store";
import { signOutLocally } from "@/lib/queries/profile";

// Login & security: itin's /auth account endpoints (password, 2FA,
// connected accounts, sessions, deactivate/delete).

type Message = { message: string };
type Tokens = { access_token: string; refresh_token: string };

const SECURITY_KEY = ["security"] as const;

// itin revokes every session but this one on a password change. A token
// from before session tracking can't be kept, so it sends fresh ones back.
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string }) => {
      const { data } = await apiClient.post<Message & Partial<Tokens>>("/auth/password/change", payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.access_token && data.refresh_token) {
        setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      }
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't change your password.")),
  });
}

// --- Two-factor (TOTP) ---------------------------------------------------

export type TwoFactorStatus = { enabled: boolean; method: "totp" | null; added_at: string | null };

export function useTwoFactorStatus() {
  const { user } = useSession();
  return useQuery({
    queryKey: [...SECURITY_KEY, "2fa"],
    queryFn: async () => (await apiClient.get<TwoFactorStatus>("/auth/2fa/status")).data,
    enabled: !!user,
  });
}

/** Step 1: get a secret to show as a QR code (`otpauth_url`) or to type in. */
export function useSetupTwoFactor() {
  return useMutation({
    mutationFn: async () =>
      (await apiClient.post<{ secret: string; otpauth_url: string }>("/auth/2fa/setup")).data,
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't start two-factor setup.")),
  });
}

/**
 * Step 2: confirm with a code from the app. Turns 2FA on, returns the
 * recovery codes (shown once), and swaps this device onto a new session,
 * since itin signs out every other one.
 */
export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) =>
      (await apiClient.post<Tokens & { recovery_codes: string[] }>("/auth/2fa/verify", { code })).data,
    onSuccess: (data) => {
      setTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
      queryClient.invalidateQueries({ queryKey: SECURITY_KEY });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "That code didn't work.")),
  });
}

/** Either the account password or a current code/recovery code. */
export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { password?: string; code?: string }) =>
      (await apiClient.post<Message>("/auth/2fa/disable", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SECURITY_KEY }),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't turn off two-factor.")),
  });
}

// --- Connected accounts --------------------------------------------------

export type Connection = { provider: "google"; email: string | null; connected_at: string | null };

export function useConnections() {
  const { user } = useSession();
  return useQuery({
    queryKey: [...SECURITY_KEY, "connections"],
    queryFn: async () => (await apiClient.get<Connection[]>("/auth/connections")).data,
    enabled: !!user,
  });
}

/** `token` is the Google ID token from the Google sign-in button. */
export function useConnectGoogle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) =>
      (await apiClient.post<Connection>("/auth/connections/google", { token })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...SECURITY_KEY, "connections"] }),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't connect Google.")),
  });
}

// itin refuses (400) when Google is the only way to sign in, i.e. no password.
export function useDisconnectGoogle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/auth/connections/google");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...SECURITY_KEY, "connections"] }),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't disconnect Google.")),
  });
}

// --- Sessions --------------------------------------------------------------

export type AuthSession = {
  id: string;
  /** The browser/app's user agent. */
  device: string | null;
  /** Client IP. */
  location: string | null;
  last_active: string;
  is_current_device: boolean;
};

export function useAuthSessions() {
  const { user } = useSession();
  return useQuery({
    queryKey: [...SECURITY_KEY, "sessions"],
    queryFn: async () => (await apiClient.get<AuthSession[]>("/auth/sessions")).data,
    enabled: !!user,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...SECURITY_KEY, "sessions"] }),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't sign that device out.")),
  });
}

// --- Deactivate / delete ---------------------------------------------------

/** Signs out everywhere. Signing back in within 30 days reactivates. */
export function useDeactivateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post<Message>("/auth/deactivate")).data,
    onSuccess: () => signOutLocally(queryClient),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't deactivate your account.")),
  });
}

export type DeletionPreview = { upcoming_booking_count: number; review_count: number };

export function useDeletionPreview(enabled = true) {
  const { user } = useSession();
  return useQuery({
    queryKey: [...SECURITY_KEY, "deletion-preview"],
    queryFn: async () => (await apiClient.get<DeletionPreview>("/auth/me/deletion-preview")).data,
    enabled: !!user && enabled,
  });
}
