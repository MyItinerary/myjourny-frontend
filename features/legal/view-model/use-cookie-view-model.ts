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
  backHref: string;
  backLabel: string;
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

  const onAcceptAll = useCallback(() => {
    const next: CookiePreferences = {
      strictlyNecessary: true,
      preferences: true,
      analytics: true,
      personalisation: true,
    };
    setPreferences(next);
    saveStoredCookiePreferences(next);
    toast.success("All cookies accepted");
    setIsPreferencesOpen(false);
  }, []);

  const onRejectNonEssential = useCallback(() => {
    const next: CookiePreferences = {
      strictlyNecessary: true,
      preferences: false,
      analytics: false,
      personalisation: false,
    };
    setPreferences(next);
    saveStoredCookiePreferences(next);
    toast.success("Non-essential cookies rejected");
    setIsPreferencesOpen(false);
  }, []);

  const onSavePreferences = useCallback(() => {
    saveStoredCookiePreferences(preferences);
    toast.success("Cookie preferences saved");
    setIsPreferencesOpen(false);
  }, [preferences]);

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
    backHref: "/legal",
    backLabel: "All legal documents",
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
