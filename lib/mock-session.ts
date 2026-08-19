"use client";

import { useEffect, useSyncExternalStore } from "react";

// Temporary stand-in for real auth — nothing in the repo reads/writes a
// session yet (no useAuth/useSession/middleware anywhere). This lets pages
// like the homepage render a guest vs. an onboarded-account view without
// depending on real auth infra. Swapping in real auth later just means
// changing what backs `useSession` — consuming components never change.
export type SessionUser = {
  firstName: string;
  name: string;
  avatarUrl?: string;
};

export type MockSessionState = "guest" | "account";

const STORAGE_KEY = "myjourny:mock-session";

const MOCK_USER: SessionUser = {
  firstName: "Amara",
  name: "Amara Okafor",
};

let state: MockSessionState = "guest";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist(next: MockSessionState) {
  state = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next);
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// SSR/first paint is always "guest" so there's no hydration mismatch;
// the real value (if any) is read from localStorage client-side after mount.
function getServerSnapshot(): MockSessionState {
  return "guest";
}

export function toggleMockSession() {
  persist(state === "guest" ? "account" : "guest");
}

export function setMockSession(next: MockSessionState) {
  persist(next);
}

export function useSession(): { user: SessionUser | null; state: MockSessionState } {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if ((stored === "guest" || stored === "account") && stored !== state) {
      persist(stored);
    }
    // Only needs to run once, on mount — `state`/`persist` are module-level,
    // not React values, so there's nothing to add to this array.
  }, []);

  return { user: current === "account" ? MOCK_USER : null, state: current };
}
