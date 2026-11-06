"use client";

import { Check } from "lucide-react";

import type { VerificationType } from "../model/guide-application.types";

export interface GuideApplicationReviewProps {
  verificationType: VerificationType;
  onDone: () => void;
}

export function GuideApplicationReview({ verificationType, onDone }: GuideApplicationReviewProps) {
  const isBusiness = verificationType === "business";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16">
      {/* Green Checkmark Badge */}
      <div className="flex size-16 items-center justify-center rounded-full bg-[#E6F7F0]">
        <Check className="size-8 stroke-[3] text-[#02A078]" />
      </div>

      {/* Main Title */}
      <h1 className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-[#130404] sm:text-4xl">
        You&apos;re in review
      </h1>

      {/* Subtitle */}
      <p className="mt-2 max-w-md font-sans text-sm text-[#6F6B72] sm:text-base">
        A real person checks this, not a bot. Here&apos;s exactly what happens next.
      </p>

      {/* 4 Numbered Steps Card */}
      <div className="mt-8 w-full rounded-2xl bg-white p-4 text-left sm:p-6">
        <ul className="space-y-5">
          {/* Step 1 */}
          <li className="flex items-start gap-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-xs font-bold text-[#130404]">
              1
            </span>
            <p className="font-sans text-xs leading-relaxed text-[#333134] sm:text-sm">
              <span className="font-bold text-[#130404]">Today:</span> you&apos;ll get an email
              confirming we received everything.
            </p>
          </li>

          {/* Step 2 */}
          <li className="flex items-start gap-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-xs font-bold text-[#130404]">
              2
            </span>
            <p className="font-sans text-xs leading-relaxed text-[#333134] sm:text-sm">
              <span className="font-bold text-[#130404]">Within 1–3 business days:</span>{" "}
              {isBusiness
                ? "Details and business details are checked and matched."
                : "your details are checked and matched."}
            </p>
          </li>

          {/* Step 3 */}
          <li className="flex items-start gap-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-xs font-bold text-[#130404]">
              3
            </span>
            <p className="font-sans text-xs leading-relaxed text-[#333134] sm:text-sm">
              <span className="font-bold text-[#130404]">Once verified:</span> you can start creating
              listings: photos, pricing, availability.
            </p>
          </li>

          {/* Step 4 */}
          <li className="flex items-start gap-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-xs font-bold text-[#130404]">
              4
            </span>
            <p className="font-sans text-xs leading-relaxed text-[#333134] sm:text-sm">
              <span className="font-bold text-[#130404]">Listing details come after this,</span>{" "}
              nothing about your experience is needed yet.
            </p>
          </li>
        </ul>
      </div>

      {/* Done Button */}
      <div className="mt-8 w-full sm:w-auto">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full bg-[#F5032D] px-14 font-sans text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#D40226] sm:w-auto sm:min-w-[200px]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
