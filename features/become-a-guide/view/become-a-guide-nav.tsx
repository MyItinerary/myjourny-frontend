"use client";

import { Menu, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function BecomeAGuideNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F0EFEB] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label="MyJourny home" className="flex items-center">
          <Image
            src="/logo/myjourny-logo.svg"
            alt="MyJourny"
            width={132}
            height={28}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/experiences"
            className="font-sans text-sm font-medium text-[#130404] transition-colors hover:text-[#F5032D]"
          >
            Back to experiences
          </Link>

          <Link
            href="/profile"
            aria-label="Profile"
            className="flex size-9 items-center justify-center rounded-full border border-[#E0DFDD] text-[#333134] transition-colors hover:bg-[#FAF9F7]"
          >
            <User className="size-4" />
          </Link>

          <button
            type="button"
            aria-label="Menu"
            className="flex size-9 items-center justify-center rounded-full text-[#333134] transition-colors hover:bg-[#FAF9F7] sm:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
