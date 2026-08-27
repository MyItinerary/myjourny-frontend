// Accumulates quiz answers across the 5 preference screens (pace,
// interests, who-with, budget, vibe) so `curating` can flush them in one
// PUT /profile/me call. Plain module state, not reactive — nothing reads
// this mid-quiz, each screen only writes its own answer on Continue, and
// `curating` reads+clears it once at the end. Doesn't survive a hard
// refresh, but neither did the per-screen useState this replaces, so
// that's not a regression.
type Preferences = {
  energyLevel?: string;
  interests?: string[];
  socialStyle?: string;
  budgetRange?: string;
  tripIntent?: string[];
};

let preferences: Preferences = {};

export function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  preferences = { ...preferences, [key]: value };
}

export function getPreferences(): Preferences {
  return preferences;
}

export function clearPreferences() {
  preferences = {};
}
