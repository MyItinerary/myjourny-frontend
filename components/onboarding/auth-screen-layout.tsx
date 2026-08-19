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
              <p className="font-sans text-2xl font-extrabold text-foreground lg:hidden">
                {heading}
              </p>
              <p className="text-sm text-muted-foreground lg:hidden">{subtitle}</p>

              <p className="hidden font-sans text-[32px] font-extrabold text-foreground lg:block">
                {heading}
              </p>
              <p className="hidden w-[353px] text-base text-muted-foreground lg:block">
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
