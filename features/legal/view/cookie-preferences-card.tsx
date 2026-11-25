"use client";

import { SlidersHorizontal } from "lucide-react";

export interface CookiePreferencesCardProps {
  label: string;
  buttonText: string;
  onClick?: () => void;
}

export function CookiePreferencesCard({
  label,
  buttonText,
  onClick,
}: CookiePreferencesCardProps) {
  return (
    <div className="my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#EBEBEB] bg-white p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#FAF9F7] text-[#130404]">
          <SlidersHorizontal className="size-5" />
        </span>
        <span className="font-sans text-sm font-medium text-[#130404]">
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center rounded-full bg-[#130404] px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#2A0808] cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  );
}
