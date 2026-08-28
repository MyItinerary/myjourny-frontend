import type { ReactNode } from "react";

import { OnboardingLogo } from "@/components/onboarding/onboarding-logo";
import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";

interface AuthScreenLayoutProps {
  heading: string;
  subtitle: string;
  children: ReactNode;
}

// Shared shell for every split-layout auth screen (sign-up, email step,
// password step, login, forgot-password) — logo, heading/subtitle (Display/7
// 32px desktop, Display/8 24px mobile, matching the confirmed Figma scale),
// the form, and the desktop-only hero photo panel.
export function AuthScreenLayout({ heading, subtitle, children }: AuthScreenLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-[361px] flex-col items-center gap-[57px] lg:max-w-[402px]">
          <div className="flex flex-col items-center gap-[26px]">
            <OnboardingLogo />
            <div className="flex flex-col items-center gap-[9px] text-center">
              <h1 className="font-sans text-2xl font-extrabold text-[#333134] lg:text-[32px] lg:leading-[38.4px]">
                {heading}
              </h1>
              <p className="max-w-[353px] font-sans text-sm leading-normal text-[#6F6B72] lg:text-base lg:leading-[24px]">
                {subtitle}
              </p>
            </div>
          </div>

          {children}
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1">
        <OnboardingSlide
          imageSrc="/images/onboarding/curated-around-you.png"
          imageAlt="A woman laughing, held up in celebration by a crowd of hands, outdoors under trees."
          headline="Experiences, curated around you"
        />
      </div>
    </div>
  );
}
