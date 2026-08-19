import Image from "next/image";

import { cn } from "@/lib/utils";

// Figma "Myjourny logo update", node 2068:24668 — 163px on mobile, 211px on desktop.
export function OnboardingLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo/myjourny-logo.svg"
      alt="MyJourny"
      width={211}
      height={36}
      priority
      className={cn("h-auto w-[163px] lg:w-[211px]", className)}
    />
  );
}
