"use client";

import Image from "next/image";
import Link from "next/link";

import type { ApplicationStep } from "../model/guide-application.types";

export interface GuideApplicationNavProps {
  step: ApplicationStep;
}

export function GuideApplicationNav({ step }: GuideApplicationNavProps) {
  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isReview = step === "review";

  const progressPercentage = isStep1 ? 50 : 100;

  return (
    <header className="w-full bg-white pt-6 sm:pt-8">
      {/* Top Logo */}
      <div className="flex justify-center">
        <Link href="/" aria-label="MyJourny home" className="flex items-center">
          <Image
            src="/logo/myjourny-logo.svg"
            alt="MyJourny"
            width={132}
            height={34}
            priority
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Progress Bar Container */}
      <div className="mx-auto mt-6 w-full max-w-2xl px-4 sm:px-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#EBEBEB]">
          <div
            className="h-full bg-[#F5032D] transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="mt-2.5 flex items-center justify-end text-xs text-[#6F6B72]">
          {isStep1 && <span>Page 1 of 2</span>}
          {isStep2 && <span>Page 2 of 2</span>}
          {isReview && <span className="w-full text-center">Submitted for review</span>}
        </div>
      </div>
    </header>
  );
}
