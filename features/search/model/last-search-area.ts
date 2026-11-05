import { useSyncExternalStore } from "react";

const KEY = "myjourny:last-search-area";
const listeners = new Set<() => void>();

/** The last area (city, neighbourhood or place) the visitor searched for, or null. */
export function readLastSearchArea(): string | null {
  try {
    return window.localStorage.getItem(KEY) || null;
  } catch {
    return null;
  }
}

/** Remembers the searched area so "Based on your search in {area}" can show up on the discovery pages. */
export function saveLastSearchArea(area: string) {
  const trimmed = area.trim();
  if (!trimmed) return;
  try {
    window.localStorage.setItem(KEY, trimmed);
  } catch {
    // Storage blocked: the rail just won't appear.
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};

/** The last searched area; null on the server and until one has been searched. */
export function useLastSearchArea(): string | null {
  return useSyncExternalStore(subscribe, readLastSearchArea, () => null);
}
