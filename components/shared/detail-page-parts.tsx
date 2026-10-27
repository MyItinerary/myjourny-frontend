"use client";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, Heart, Info, MapPin, Share2, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// Pieces the experience and event detail pages share (Figma "Experience
// details" 2532:48478 and "Event details" 2470:39270): breadcrumbs, section
// headings, fact rows, the host strip and the map placeholder.

export type DetailBreadcrumb = { label: string; href?: string };

export function DetailBreadcrumbs({ items }: { items: DetailBreadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-start gap-2">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-start gap-1.5 font-sans text-sm text-muted-foreground">
          {item.href ? (
            <Link href={item.href} className="text-brand hover:underline">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && <span aria-hidden>/</span>}
        </span>
      ))}
    </nav>
  );
}

/** A page section's title: 20px bold, or 24px for the lead "About" section. */
export function DetailSectionHeading({ children, size = "sm" }: { children: ReactNode; size?: "sm" | "md" }) {
  return (
    <h2
      className={cn(
        "font-heading font-bold",
        size === "md" ? "text-2xl text-[#130404]" : "text-xl text-foreground",
      )}
    >
      {children}
    </h2>
  );
}

export function DetailDivider() {
  return <hr className="h-px w-full border-0 bg-[#E7E7E7]" />;
}

/** A titled block of the page body, with the divider that follows it. */
export function DetailSection({
  title,
  size = "sm",
  children,
}: {
  title: string;
  size?: "sm" | "md";
  children: ReactNode;
}) {
  return (
    <>
      <section className="flex flex-col gap-5">
        <DetailSectionHeading size={size}>{title}</DetailSectionHeading>
        {children}
      </section>
      <DetailDivider />
    </>
  );
}

/** Body copy that folds long text behind "Show more". */
export function DetailExpandableText({ text, limit = 280 }: { text: string; limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  return (
    <p className="font-sans text-base leading-[26px] text-[#6F6B72]">
      {isLong && !expanded ? `${text.slice(0, limit).trimEnd()}... ` : `${text} `}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer font-medium text-[#F5032D] underline underline-offset-2 hover:opacity-85"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </p>
  );
}

/** An icon, a title and a line or two: "Fitness level", "Parking". */
export function DetailFact({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <DetailIconTile icon={Icon} />
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{body}</span>
      </div>
    </div>
  );
}

/** The square icon tile every fact and list row uses: 36px, an 18px icon. */
export function DetailIconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
      <Icon className="size-[18px]" aria-hidden />
    </div>
  );
}

/** "ⓘ Please note…" under a section. */
export function DetailNote({ children, icon: Icon = Info }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex items-center gap-1 font-sans text-xs leading-[18px] text-[#6F6B72]">
      <Icon className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

/** The host (or organiser) on the left, where it happens on the right. */
export function DetailHostStrip({
  name,
  href,
  verified,
  blurb,
  placeName,
  placeDetail,
}: {
  name: string;
  href?: string | null;
  verified?: boolean;
  blurb: string;
  placeName: string;
  placeDetail: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 self-stretch rounded-[16px] border border-[#E7E7E7] bg-white p-[20px] sm:flex-row sm:items-center sm:gap-[20px]">
      <div className="flex flex-1 items-center gap-3.5">
        <Avatar className="size-[52px] shrink-0">
          <AvatarFallback className="bg-[#F4F2EE] font-sans text-lg font-semibold text-[#333134]">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[16px] leading-[24px] font-medium text-[#333134]">
              {href ? (
                <Link href={href} className="transition-colors hover:text-brand hover:underline">
                  {name}
                </Link>
              ) : (
                name
              )}
            </span>
            {verified && <BadgeCheck className="size-[15px] shrink-0 text-[#02A078]" aria-label="Verified" />}
          </div>
          <p className="font-sans text-[14px] leading-[22px] text-[#6F6B72]">{blurb}</p>
        </div>
      </div>
      <div className="hidden h-[48px] w-px bg-[#E7E7E7] sm:block" />
      <div className="flex items-center gap-3">
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-[9.333px] bg-[#F4F2EE]">
          <MapPin className="size-5 text-[#6F6B72]" aria-hidden />
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-[16px] leading-[24px] font-medium text-[#333134]">{placeName}</span>
          {placeDetail && <p className="font-sans text-[14px] leading-[22px] text-[#6F6B72]">{placeDetail}</p>}
        </div>
      </div>
    </div>
  );
}

/** The "Where you'll be" map: a labelled pin on a grid until a real map lands. */
export function DetailMapPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-[20px] bg-[#F4F2EE]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,#E7E7E7_1px,transparent_1px),linear-gradient(to_bottom,#E7E7E7_1px,transparent_1px)] bg-[size:50px_50px]"
      />
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <MapPin className="size-6 fill-[#F5032D] text-[#F5032D]" aria-hidden />
        <span className="rounded-full bg-white px-3 py-1.5 font-sans text-xs font-medium text-[#333134] shadow-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

/** Wishlist and share, in the title row. */
export function DetailActions({
  saved,
  onToggleSave,
  onShare,
  className,
}: {
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-4 font-sans text-sm font-medium text-foreground", className)}>
      <button type="button" onClick={onToggleSave} className="flex cursor-pointer items-center gap-1.5">
        <Heart className={cn("size-4", saved && "fill-[#F5032D] text-[#F5032D]")} aria-hidden />
        {saved ? "Saved" : "Add to wishlist"}
      </button>
      <button type="button" onClick={onShare} className="flex cursor-pointer items-center gap-1.5">
        <Share2 className="size-4" aria-hidden />
        Share
      </button>
    </div>
  );
}
