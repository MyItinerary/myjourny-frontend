"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  clearAuth,
  setAuth,
  setUser,
  useSession,
  type SessionUser,
} from "@/lib/auth/session-store";
import { clearPreferences } from "@/lib/onboarding/preferences-store";

type Tokens = { access_token: string; refresh_token: string; token_type: string };

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

function authErrorMessage(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data
    ?.detail;
  return detail ?? fallback;
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
    mutationFn: async (payload: { email: string; password: string; signup_type?: string }) => {
      const { data } = await apiClient.post<Tokens>("/auth/register", {
        signup_type: "traveller",
        ...payload,
      });
      return data;
    },
    onSuccess: (tokens, variables) => completeAuth(tokens, variables.email),
    onError: (error) =>
      toast.error(authErrorMessage(error, "Couldn't create your account. Please try again.")),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      // /auth/login is OAuth2PasswordRequestForm-based (form-urlencoded),
      // not JSON.
      const body = new URLSearchParams({ username: payload.email, password: payload.password });
      const { data } = await apiClient.post<Tokens>("/auth/login", body);
      return data;
    },
    onSuccess: (tokens, variables) => completeAuth(tokens, variables.email),
    onError: (error) => toast.error(authErrorMessage(error, "Incorrect email or password.")),
  });
}

export function useGoogleAuth() {
  return useMutation({
    mutationFn: async (payload: {
      token: string;
      signup_type?: string;
      user_id?: string;
    }) => {
      const { data } = await apiClient.post<Tokens>("/auth/google", {
        signup_type: "traveller",
        ...payload,
      });
      return data;
    },
    onSuccess: (tokens) => completeAuth(tokens, null),
    onError: (error) =>
      toast.error(authErrorMessage(error, "Couldn't sign in with Google. Please try again.")),
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
      toast.error(authErrorMessage(error, "Something went wrong. Please try again.")),
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
      toast.error(authErrorMessage(error, "Invalid or expired reset link. Please try again.")),
  });
}

export function useLogout() {
  return useMutation({
    // itin's refresh tokens are stateless with no revocation table — logout
    // is client-side-only (clear local session + the session-route cookie).
    mutationFn: async () => {
      clearAuth();
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
