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
          <p className="max-w-[353px] font-sans text-[32px] font-extrabold text-foreground">
            {heading}
          </p>
          <p className="max-w-[353px] text-base text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex w-full max-w-[345px] flex-col gap-4">
        <Button size="cta" className="w-full" render={<Link href={primaryHref} />}>
          {primaryLabel}
        </Button>
        {secondaryLabel && secondaryHref && (
          <Button
            variant="outline"
            size="cta"
            className="w-full border-primary text-primary hover:bg-primary/5"
            render={<Link href={secondaryHref} />}
          >
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
