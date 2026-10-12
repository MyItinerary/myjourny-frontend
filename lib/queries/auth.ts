"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import {
  clearAuth,
  setAuth,
  setUser,
  useSession,
  type SessionUser,
} from "@/lib/auth/session-store";
import { clearPreferences } from "@/lib/onboarding/preferences-store";

type Tokens = { access_token: string; refresh_token: string; token_type: string };

// With 2FA on, login/Google/Apple answer 200 with this instead of tokens
// until the request carries a valid `code` (TOTP or recovery code). A wrong
// code is a 401.
export type TwoFactorChallenge = { "2fa_required": true };
type AuthResponse = Tokens | TwoFactorChallenge;

export function isTwoFactorChallenge(data: unknown): data is TwoFactorChallenge {
  return typeof data === "object" && data !== null && "2fa_required" in data;
}

// Finish sign-in, unless the server is asking for a 2FA code first.
async function completeAuthUnlessChallenged(data: AuthResponse, placeholderEmail: string | null) {
  if (isTwoFactorChallenge(data)) return;
  await completeAuth(data, placeholderEmail);
}

type MeResponse = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  completed: boolean;
};

function toSessionUser(me: MeResponse): SessionUser {
  return { id: me.id, email: me.email, fullName: me.full_name, avatarUrl: me.avatar_url };
}

async function fetchMe(): Promise<MeResponse> {
  const { data } = await apiClient.get<MeResponse>("/auth/me");
  return data;
}

function notifySessionRoute() {
  fetch("/api/auth/session", { method: "POST" }).catch(() => {});
}

// Register/login/google-auth all return tokens only, no user — set a
// placeholder immediately (so `apiClient` is authorized for the follow-up
// call) then fill in the real user from /auth/me.
async function completeAuth(tokens: Tokens, placeholderEmail: string | null) {
  // The onboarding quiz's localStorage draft is browser-scoped, not
  // account-scoped — clear it the moment a session becomes "about this
  // specific account" (register, login, or Google, whichever this is) so
  // a stale/abandoned draft from a previous account never leaks into a
  // brand-new registration's quiz screens. For register this fires before
  // the quiz UI ever mounts, so it can't clobber anything the current
  // signup is about to write.
  clearPreferences();
  setAuth(tokens, { id: "", email: placeholderEmail, fullName: null, avatarUrl: null });
  try {
    const me = await fetchMe();
    setUser(toSessionUser(me));
  } catch {
    // A failed /auth/me right after a successful auth response shouldn't
    // block sign-in — the placeholder is still enough for useSession() to
    // treat this as authenticated; the next /auth/me query will retry.
  }
  notifySessionRoute();
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      signup_type?: string;
      /** E.164, e.g. +2347016377711; saved to the new profile. */
      phone_number?: string;
    }) => {
      const { data } = await apiClient.post<Tokens>("/auth/register", {
        signup_type: "traveller",
        ...payload,
      });
      return data;
    },
    onSuccess: (tokens, variables) => completeAuth(tokens, variables.email),
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't create your account. Please try again.")),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; code?: string }) => {
      // /auth/login is OAuth2PasswordRequestForm-based (form-urlencoded),
      // not JSON.
      const body = new URLSearchParams({ username: payload.email, password: payload.password });
      if (payload.code) body.set("code", payload.code);
      const { data } = await apiClient.post<AuthResponse>("/auth/login", body);
      return data;
    },
    onSuccess: (data, variables) => completeAuthUnlessChallenged(data, variables.email),
    onError: (error, variables) =>
      toast.error(
        apiErrorMessage(error, variables.code ? "That code didn't work." : "Incorrect email or password.")
      ),
  });
}

export function useGoogleAuth() {
  return useMutation({
    mutationFn: async (payload: {
      token: string;
      signup_type?: string;
      user_id?: string;
      code?: string;
    }) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/google", {
        signup_type: "traveller",
        ...payload,
      });
      return data;
    },
    onSuccess: (data) => completeAuthUnlessChallenged(data, null),
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't sign in with Google. Please try again.")),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await apiClient.post<{ message: string }>(
        "/auth/password/request-reset",
        payload
      );
      return data;
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Something went wrong. Please try again.")),
  });
}

export function useResetPasswordWithToken() {
  return useMutation({
    mutationFn: async (payload: { token: string; new_password: string }) => {
      const { data } = await apiClient.post<{ message: string }>(
        "/auth/password/reset-with-token",
        payload
      );
      return data;
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Invalid or expired reset link. Please try again.")),
  });
}

export function useAppleAuth() {
  return useMutation({
    mutationFn: async (payload: {
      identity_token: string;
      user_id?: string;
      full_name?: string;
      signup_type?: string;
      code?: string;
    }) => {
      const { data } = await apiClient.post<AuthResponse>("/auth/apple", {
        signup_type: "traveller",
        ...payload,
      });
      return data;
    },
    onSuccess: (data) => completeAuthUnlessChallenged(data, null),
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't sign in with Apple. Please try again.")),
  });
}

export type TempAuthResponse = {
  access_token: string;
  refresh_token?: string;
  user_id: string;
  signup_type?: string;
};

export function useCreateTempUser() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<TempAuthResponse>("/auth/temp", {
        signup_type: "traveller",
      });
      return data;
    },
    onSuccess: (data) => {
      setAuth(
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token ?? "",
        },
        { id: data.user_id, email: null, fullName: "Guest User", avatarUrl: null }
      );
      notifySessionRoute();
    },
  });
}

export type ActivateUserPayload = {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export function useActivateUser() {
  return useMutation({
    mutationFn: async (payload: ActivateUserPayload) => {
      const { data } = await apiClient.post<MeResponse>("/auth/activate", payload);
      return data;
    },
    onSuccess: (me) => {
      setUser(toSessionUser(me));
      toast.success("Account activated!");
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't activate your account. Please try again.")),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post("/auth/logout");
      } catch {
        // Safe to proceed even if backend logout fails or is offline
      }
      clearAuth();
      clearPreferences();
      await fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    },
  });
}

export function useMe() {
  const { state } = useSession();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: state === "account",
  });
}

