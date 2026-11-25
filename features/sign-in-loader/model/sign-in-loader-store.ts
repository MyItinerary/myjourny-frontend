import { useSyncExternalStore } from "react";

/** A sign-in in progress: where it started, and when. */
export type SignInLoaderState = { fromPath: string; startedAt: number };

let current: SignInLoaderState | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Cover the screen from here until the page signing in leads to has loaded. */
export function startSignInLoader(fromPath = typeof window === "undefined" ? "" : window.location.pathname) {
  current = { fromPath, startedAt: Date.now() };
  emit();
}

/** The sign-in stopped (an error, a 2FA code to enter) or the next page is ready. */
export function stopSignInLoader() {
  if (!current) return;
  current = null;
  emit();
}

export function useSignInLoaderState(): SignInLoaderState | null {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
