export interface CookiePreferences {
  strictlyNecessary: boolean;
  preferences: boolean;
  analytics: boolean;
  personalisation: boolean;
}

export const COOKIE_PREFERENCES_STORAGE_KEY = "myjourny_cookie_preferences";

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  strictlyNecessary: true,
  preferences: true,
  analytics: false,
  personalisation: false,
};

export function getStoredCookiePreferences(): CookiePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_COOKIE_PREFERENCES;
  }
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_COOKIE_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      strictlyNecessary: true,
      preferences: typeof parsed.preferences === "boolean" ? parsed.preferences : true,
      analytics: typeof parsed.analytics === "boolean" ? parsed.analytics : false,
      personalisation:
        typeof parsed.personalisation === "boolean" ? parsed.personalisation : false,
    };
  } catch {
    return DEFAULT_COOKIE_PREFERENCES;
  }
}

export function saveStoredCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COOKIE_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ ...prefs, strictlyNecessary: true, updatedAt: new Date().toISOString() })
    );
  } catch {
    // Ignore storage quota / restricted context errors
  }
}
