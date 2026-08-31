import Link from "next/link";

import { ChevronLeftIcon } from "@/components/icons/onboarding-icons";
import { cn } from "@/lib/utils";

// Figma "Header section" (mobile only) — back button + question heading/subtitle.
// Note: mobile uses Heading/3 (28px SemiBold) + Body/3 (18px), a distinct
// scale from the desktop version of the same question (Display/7 32px + Body/4 16px).
interface OnboardingHeaderProps {
  heading: string;
  subtitle: string;
  backHref: string;
  className?: string;
}

export function OnboardingHeader({
  heading,
  subtitle,
  backHref,
  className,
}: OnboardingHeaderProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex h-[58px] items-center px-4 pt-2">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-[42px] items-center justify-center rounded-full bg-white"
        >
          <ChevronLeftIcon className="size-4 text-foreground" />
        </Link>
      </div>
      <div className="flex flex-col gap-2 px-4 py-6">
        <h1 className="font-sans text-[28px] font-semibold leading-[42px] text-[#333134]">
          {heading}
        </h1>
        <p className="font-sans text-lg leading-7 text-[#6F6B72]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
