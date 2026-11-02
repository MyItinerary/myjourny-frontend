import Image from "next/image";

import { cn } from "@/lib/utils";

import type { ListingStatus } from "../model/home.types";

const CHIP: Record<ListingStatus, string> = {
  Live: "text-[#0CBA65] bg-[#F0FCF5]",
  Draft: "text-[#6F6B72] bg-[#F5F5F5]",
  "In review": "text-[#B4760A] bg-[#FDF7EB]",
  Hidden: "text-[#6F6B72] bg-[#F5F5F5]",
  Paused: "text-[#B4760A] bg-[#FDF7EB]",
  "Sold out": "text-[#3086FF] bg-[#F0F6FF]",
  Archived: "text-[#6F6B72] bg-[#F5F5F5]",
  Rejected: "text-[#F5032D] bg-[#FEF2F3]",
};

/** A booking's status, coloured like the listing status it matches. */
export function StatusChip({ status, label }: { status: ListingStatus; label: string }) {
  return (
    <span className={cn("inline-block rounded-full px-[9px] py-[3px] text-[11px] font-medium whitespace-nowrap", CHIP[status])}>{label}</span>
  );
}

/** The guest's photo, or their initials when there isn't one. */
export function BookingAvatar({ name, url, size }: { name: string; url: string | null; size: number }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return url ? (
    <Image src={url} alt="" width={size} height={size} unoptimized style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[#F4F2EE] font-sans text-[13px] font-semibold text-[#333134]"
    >
      {initials}
    </span>
  );
}
