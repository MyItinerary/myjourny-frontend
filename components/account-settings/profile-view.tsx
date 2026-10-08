"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LanguageCurrencySection } from "@/components/account-settings/language-currency";
import { LoginSecuritySection } from "@/components/account-settings/login-security";
import { NotificationsSection } from "@/components/account-settings/notifications";
import { PersonalInfoSection } from "@/components/account-settings/personal-info";
import { PreferencesSection } from "@/components/account-settings/preferences";
import { PrivacySection } from "@/components/account-settings/privacy";
import { SETTINGS_NAV_ITEMS, SettingsNav } from "@/components/account-settings/settings-nav";
import { SettingsHeader } from "@/components/account-settings/settings-header";

export function ProfileView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = SETTINGS_NAV_ITEMS.some((item) => item.key === tabParam) ? tabParam! : "personal";

  const [active, setActive] = useState(initialTab);

  const activeLabel = SETTINGS_NAV_ITEMS.find((item) => item.key === active)?.label ?? "";

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SettingsHeader />

      <div className="flex w-full flex-1 flex-col lg:flex-row">
        <SettingsNav active={active} onChange={setActive} />

        <div className="flex-1 px-4 py-10 lg:px-16 lg:py-14">
          {active === "personal" ? (
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
