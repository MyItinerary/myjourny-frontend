import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Full-bleed photo + dark overlay + bottom-left headline. Figma: 2068:24831.
export interface OnboardingSlideProps {
  imageSrc: string;
  imageAlt: string;
  headline: ReactNode;
  className?: string;
}

export function OnboardingSlide({
  imageSrc,
  imageAlt,
  headline,
  className,
}: OnboardingSlideProps) {
  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-black/[0.29]" />

      {/* Quick link button on the image to preview the onboarding questionnaire flow */}
      <Link
        href="/onboarding/get-to-know-you"
        className="absolute top-6 right-6 z-20 flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-bold text-primary shadow-xl backdrop-blur transition-all hover:bg-white hover:scale-105 hover:shadow-2xl"
      >
        <span>⚡ Quick Jump to Onboarding Flow</span>
      </Link>

      {/* Figma pins this with a fixed-canvas calc(); ported to edge padding so it holds at any viewport size. */}
      <p className="absolute bottom-9 left-9 w-[calc(100%-2*(--spacing(9)))] max-w-[431px] font-sans text-[44px] leading-[1.2] font-extrabold text-white">
        {headline}
      </p>
    </div>
  );
}
