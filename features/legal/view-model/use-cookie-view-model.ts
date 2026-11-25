import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { cookieData } from "../model/cookie-data";
import {
  type CookiePreferences,
  DEFAULT_COOKIE_PREFERENCES,
  getStoredCookiePreferences,
  saveStoredCookiePreferences,
} from "../model/cookie-preferences.types";
import type { TermsData } from "../model/terms.types";

export interface CookieViewModel {
  data: TermsData;
  activeSectionId: string;
  onSectionSelect: (id: string) => void;
  onManagePreferences: () => void;
  isPreferencesOpen: boolean;
  preferences: CookiePreferences;
  openPreferences: () => void;
  closePreferences: () => void;
  onTogglePreference: (key: keyof Omit<CookiePreferences, "strictlyNecessary">) => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onSavePreferences: () => void;
}

const SAVE_FAILED = "We couldn't save your cookie choices. Check your browser's storage settings and try again.";

export function useCookieViewModel(): CookieViewModel {
  const [activeSectionId, setActiveSectionId] = useState<string>("section-1");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES);

  const onSectionSelect = useCallback((id: string) => {
    setActiveSectionId(id);
    if (typeof document !== "undefined") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  const openPreferences = useCallback(() => {
    setPreferences(getStoredCookiePreferences());
    setIsPreferencesOpen(true);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-cookie-preferences"));
    }
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const onTogglePreference = useCallback(
    (key: keyof Omit<CookiePreferences, "strictlyNecessary">) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  // A failed save keeps the dialog open: this is a consent record, so never claim it was stored.
  const persist = useCallback((next: CookiePreferences, savedMessage: string) => {
    setPreferences(next);
    if (!saveStoredCookiePreferences(next)) {
      toast.error(SAVE_FAILED);
      return;
    }
    toast.success(savedMessage);
    setIsPreferencesOpen(false);
  }, []);

  const onAcceptAll = useCallback(() => {
    const next: CookiePreferences = {
      strictlyNecessary: true,
      preferences: true,
      analytics: true,
      personalisation: true,
    };
    persist(next, "All cookies accepted");
  }, [persist]);

  const onRejectNonEssential = useCallback(() => {
    const next: CookiePreferences = {
      strictlyNecessary: true,
      preferences: false,
      analytics: false,
      personalisation: false,
    };
    persist(next, "Non-essential cookies rejected");
  }, [persist]);

  const onSavePreferences = useCallback(() => {
    persist(preferences, "Cookie preferences saved");
  }, [persist, preferences]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sectionIds = cookieData.tableOfContents
      .filter((item) => !item.isPartHeading)
      .map((item) => item.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((prev, curr) =>
            curr.boundingClientRect.top < prev.boundingClientRect.top ? curr : prev
          );
          setActiveSectionId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  return {
    data: cookieData,
    activeSectionId,
    onSectionSelect,
    onManagePreferences: openPreferences,
    isPreferencesOpen,
    preferences,
    openPreferences,
    closePreferences,
    onTogglePreference,
    onAcceptAll,
    onRejectNonEssential,
    onSavePreferences,
  };
}
