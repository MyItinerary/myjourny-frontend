"use client";

import { useEffect, useSyncExternalStore } from "react";

// Real auth session store — replaces the old `lib/mock-session.ts`. Keeps
// the same `useSyncExternalStore` + localStorage shape (and the same
// `useSession()` return shape) that module used, so callers only had to
// change their import path.
export type SessionUser = {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export type SessionState = "guest" | "account";

type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

const STORAGE_KEY = "myjourny:auth";

let stored: StoredAuth | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(next: StoredAuth | null) {
  stored = next;
  if (typeof window !== "undefined") {
    if (next) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return stored;
}

// SSR/first paint is always "guest" so there's no hydration mismatch; the
// real value (if any) is read from localStorage client-side after mount.
function getServerSnapshot(): StoredAuth | null {
  return null;
}

function readStorage(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

/** Called after a successful register/login/google-auth response. */
export function setAuth(
  tokens: { access_token: string; refresh_token: string },
  user: SessionUser
) {
  persist({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, user });
}

/** Updates just the user (e.g. after a `/auth/me` refetch), keeping tokens. */
export function setUser(user: SessionUser) {
  if (!stored) return;
  persist({ ...stored, user });
}

/** Updates just the tokens (e.g. after a refresh), keeping the current user. */
export function setTokens(tokens: { access_token: string; refresh_token: string }) {
  if (!stored) return;
  persist({ ...stored, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
}

export function clearAuth() {
  persist(null);
}

/**
 * Synchronous, non-reactive read for use outside React (the axios
 * interceptor). Falls back to localStorage directly in case this is called
 * before any component has mounted `useSession()` to hydrate `stored`.
 */
export function getTokens() {
  const current = stored ?? readStorage();
  return {
    accessToken: current?.accessToken ?? null,
    refreshToken: current?.refreshToken ?? null,
  };
}

export function useSession(): { user: SessionUser | null; state: SessionState } {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const fromStorage = readStorage();
    if (fromStorage && !stored) {
      persist(fromStorage);
    }
    // Only needs to run once, on mount — `stored`/`persist` are module-level,
    // not React values, so there's nothing to add to this array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user: current?.user ?? null, state: current ? "account" : "guest" };
}
