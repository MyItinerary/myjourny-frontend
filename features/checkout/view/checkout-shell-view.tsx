import type { ReactNode } from "react";

import { OnboardingLogo } from "@/components/onboarding/onboarding-logo";

// Figma "Desktop - 4/6": logo on top, the form on the left and the order
// summary on the right. On a phone the summary is a bar at the bottom, so the
// page keeps room beneath the form.
export function CheckoutShellView({ children, summary }: { children: ReactNode; summary: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#FCFCFC] pb-44 lg:pb-0">
      <div className="mx-auto w-full max-w-[1140px] px-4 pt-10 lg:px-6 lg:pt-[86px] xl:px-0">
        <div className="flex justify-center lg:justify-start">
          <OnboardingLogo />
        </div>
        <div className="mt-8 flex flex-col gap-10 lg:mt-[53px] lg:flex-row lg:items-start lg:gap-8 xl:gap-[54px]">
          <div className="flex w-full min-w-0 flex-col gap-6 lg:max-w-[583px] lg:flex-1">{children}</div>
          <div className="lg:w-[min(503px,42%)] lg:shrink-0">{summary}</div>
        </div>
      </div>
    </div>
  );
}
