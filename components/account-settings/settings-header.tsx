"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function SettingsHeader() {
  const router = useRouter();

  function handleClose() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between gap-6 border-b border-border bg-white px-4 sm:px-10">
      <Image
        src="/logo/myjourny-logo.svg"
        alt="MyJourny"
        width={120}
        height={21}
        className="h-[26px] w-auto"
      />
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close settings"
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground transition-colors duration-[120ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#EEEEEE] active:bg-[#E0E0E0] focus-visible:ring-4 focus-visible:ring-brand/16 focus-visible:outline-none"
      >
        <X size={22} />
      </button>
    </div>
  );
}
