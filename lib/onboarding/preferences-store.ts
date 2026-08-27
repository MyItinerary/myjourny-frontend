"use client";

// Accumulates quiz answers across the 5 preference screens (pace,
// interests, who-with, budget, vibe) so `curating` can flush them in one
// PUT /profile/me call. Persisted to localStorage so a refresh or
// back-navigation mid-quiz doesn't lose earlier answers — each screen
// reads its own field back out on mount (see PillQuestionScreen's
// `getInitialSelected`) instead of always starting blank.
//
// Always cleared on a successful save (see curating/content.tsx) — once
// onboarding finishes, the real profile data from the backend is the
// source of truth, not this local draft.
type Preferences = {
  energyLevel?: string;
  interests?: string[];
  socialStyle?: string;
  budgetRange?: string;
  tripIntent?: string[];
};

const STORAGE_KEY = "myjourny:onboarding-preferences";

// No module-level cache on purpose — every call reads/writes localStorage
// directly. All call sites are client-only (event handlers, useEffect),
// never a component's render body, so there's no SSR/hydration concern
// here; the `typeof window` guards are just defensive.
function readStorage(): Preferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Preferences) : {};
  } catch {
    return {};
  }
}

function writeStorage(next: Preferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  writeStorage({ ...readStorage(), [key]: value });
}

export function getPreferences(): Preferences {
  return readStorage();
}

export function clearPreferences() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
