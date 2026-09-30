"use client";

import { useEffect, useRef, useState } from "react";
import { LanguageCurrencySection } from "@/components/account settings/language-currency";
import { LoginSecuritySection } from "@/components/account settings/login-security";
import { NotificationsSection } from "@/components/account settings/notifications";
import { PersonalInfoSection } from "@/components/account settings/personal-info";
import { PreferencesSection } from "@/components/account settings/preferences";
import { PrivacySection } from "@/components/account settings/privacy";
import { SectionSkeleton } from "@/components/account settings/section-ui";
import { SETTINGS_NAV_ITEMS, SettingsNav } from "@/components/account settings/settings-nav";
import { SettingsHeader } from "@/components/account settings/settings-header";

const SECTION_LOAD_DELAY = 700;

export function ProfileView() {
  const [active, setActive] = useState("personal");
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => setLoading(false), SECTION_LOAD_DELAY);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(key: string) {
    if (key === active) return;
    setActive(key);
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setLoading(false), SECTION_LOAD_DELAY);
  }

  const activeLabel = SETTINGS_NAV_ITEMS.find((item) => item.key === active)?.label ?? "";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SettingsHeader />

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <SettingsNav active={active} onChange={handleChange} />

        <div className="flex-1 px-4 py-10 lg:px-16 lg:py-14">
          {loading ? (
            <SectionSkeleton />
          ) : active === "personal" ? (
            <PersonalInfoSection />
          ) : active === "security" ? (
            <LoginSecuritySection />
          ) : active === "privacy" ? (
            <PrivacySection />
          ) : active === "notifications" ? (
            <NotificationsSection />
          ) : active === "taste" ? (
            <PreferencesSection />
          ) : active === "locale" ? (
            <LanguageCurrencySection />
          ) : (
            <div className="max-w-[720px]">
              <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
                {activeLabel}
              </div>
              <div className="mt-4 text-base text-muted-foreground">
                This section is not built yet.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
