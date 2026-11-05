import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  COOKIE_PREFERENCES_STORAGE_KEY,
  DEFAULT_COOKIE_PREFERENCES,
  getStoredCookiePreferences,
  saveStoredCookiePreferences,
} from "./cookie-preferences.types";

describe("cookie-preferences.types", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns DEFAULT_COOKIE_PREFERENCES when nothing is stored", () => {
    expect(getStoredCookiePreferences()).toEqual(DEFAULT_COOKIE_PREFERENCES);
  });

  it("returns default preferences if JSON is invalid", () => {
    window.localStorage.setItem(COOKIE_PREFERENCES_STORAGE_KEY, "invalid-json");
    expect(getStoredCookiePreferences()).toEqual(DEFAULT_COOKIE_PREFERENCES);
  });

  it("saves and retrieves preferences correctly", () => {
    saveStoredCookiePreferences({
      strictlyNecessary: true,
      preferences: false,
      analytics: true,
      personalisation: true,
    });

    const retrieved = getStoredCookiePreferences();
    expect(retrieved.strictlyNecessary).toBe(true);
    expect(retrieved.preferences).toBe(false);
    expect(retrieved.analytics).toBe(true);
    expect(retrieved.personalisation).toBe(true);
  });

  it("reports whether the choice was stored", () => {
    const prefs = { strictlyNecessary: true, preferences: false, analytics: false, personalisation: false };
    expect(saveStoredCookiePreferences(prefs)).toBe(true);

    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(saveStoredCookiePreferences(prefs)).toBe(false);
    setItem.mockRestore();
  });
});
