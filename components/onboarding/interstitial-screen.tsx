import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { OnboardingLogo } from "@/components/onboarding/onboarding-logo";

interface InterstitialScreenProps {
  heading: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /**
   * Blank rounded-square placeholder in Figma — no illustration filled in
   * yet. Omit for the default placeholder box; pass `null` explicitly for
   * screens with no illustration slot at all (e.g. the reset-password
   * Success screen).
   */
  illustration?: ReactNode | null;
}

// Shared shell for "Desktop - 2"/"Interstitial" (2068:25022 / 2068:25821) and
// the final "curating" screen — logo, illustration slot, heading, 1-2 CTAs.
export function InterstitialScreen({
  heading,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  illustration,
}: InterstitialScreenProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center bg-gradient-to-b from-muted to-background px-6 py-16">
      <OnboardingLogo className="lg:absolute lg:top-[86px] lg:left-1/2 lg:w-[211px] lg:-translate-x-1/2" />

      <div className="flex flex-1 flex-col items-center justify-center gap-9">
        {illustration === undefined ? (
          <div
            aria-hidden
            className="size-20 rounded-2xl border border-[#f5f5f5] bg-[#fafafa] lg:size-[130.612px] lg:rounded-[12.245px]"
          />
        ) : (
          illustration
        )}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h1 className="max-w-[600px] font-sans text-[32px] font-extrabold leading-[38.4px] text-[#333134]">
            {heading}
          </h1>
          <p className="max-w-[500px] font-sans text-[16px] font-normal leading-[24px] text-[#6F6B72]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-[345px] flex-col gap-4">
        <Button
          size="cta"
          className="w-full h-auto py-3 px-4 gap-[10px] rounded-[200px] bg-[#2C0101] text-white hover:bg-[#2C0101]/90"
          render={<Link href={primaryHref} />}
        >
          {primaryLabel}
        </Button>
        {secondaryLabel && secondaryHref && (
          <Button
            variant="outline"
            size="cta"
            className="w-full h-auto py-3 px-4 gap-[10px] rounded-[200px] border border-[#2C0101] bg-transparent text-[#2C0101] hover:bg-[#2C0101]/5"
            render={<Link href={secondaryHref} />}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
