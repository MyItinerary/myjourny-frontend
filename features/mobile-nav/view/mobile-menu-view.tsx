"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import type { MobileMenuLink, MobileMenuViewModel } from "../view-model/use-mobile-menu-view-model";

const ROW = "flex w-full cursor-pointer items-center gap-[13px] py-2 text-left";

// Illustrated icons (Figma "image 16"): 44px artwork cropped to a 32px window.
function Tile({ src, accent = false }: { src: string; accent?: boolean }) {
  return (
    <span
      className={cn(
        "relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px]",
        accent ? "border-[0.5px] border-[#FBD4D8] bg-[#FDE9EC]" : "bg-[#F5F3EF]",
      )}
    >
      {accent && (
        <Image
          src="/icons/nav/guide-bg.svg"
          alt=""
          width={56}
          height={110}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[110px] w-14 max-w-none -translate-x-1/2 -translate-y-1/2"
        />
      )}
      <span className="relative block size-8 shrink-0 overflow-hidden">
        <Image src={src} alt="" width={44} height={44} className="absolute -left-1.5 -top-1.5 size-11 max-w-none" />
      </span>
    </span>
  );
}

function MenuLink({ link, onClose, accent = false }: { link: MobileMenuLink; onClose: () => void; accent?: boolean }) {
  return (
    <Link href={link.href} onClick={onClose} className={ROW}>
      <Tile src={link.icon} accent={accent} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className={cn("text-base leading-6", accent ? "text-[#F5032D]" : "text-[#212121]")}>{link.label}</span>
          {link.badge ? (
            <span className="rounded-full bg-[#F5032D]/10 px-2 text-[11px] font-bold text-[#F5032D]">{link.badge}</span>
          ) : null}
        </span>
        {link.sublabel && (
          <span className={cn("text-xs leading-[18px]", accent ? "text-[#130404]" : "text-[#9E9E9E]")}>{link.sublabel}</span>
        )}
      </span>
      <Image src="/icons/nav/chevron-right.svg" alt="" width={18} height={18} unoptimized className="shrink-0" />
    </Link>
  );
}

/** Phone-only full-screen profile menu. Portalled to the body so the header's blur can't pin it to the header. */
export function MobileMenuView({ hostingHref, links, guide, auth, onClose, onAuth }: MobileMenuViewModel) {
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-mobile-menu
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white px-6 pt-[max(47px,env(safe-area-inset-top))] pb-6 lg:hidden"
    >
      <div className="flex h-[60px] shrink-0 items-center justify-between">
        <Link href="/" aria-label="Myjourny home" onClick={onClose} className="flex shrink-0 items-center">
          <Image src="/logo/myjourny-logo.svg" alt="Myjourny" width={167} height={29} style={{ width: "auto" }} className="h-[29px] w-auto" />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#F4F2EE]"
        >
          <Image src="/icons/nav/close.svg" alt="" width={20} height={20} unoptimized />
        </button>
      </div>

      {hostingHref && (
        <div className="py-4">
          <Link
            href={hostingHref}
            onClick={onClose}
            className="flex h-14 items-center gap-3 rounded-2xl bg-[#333134] px-3.5 text-base font-medium text-white"
          >
            <Image src="/icons/nav/switch.svg" alt="" width={22} height={22} unoptimized className="shrink-0" />
            <span className="flex-1">Switch to guiding</span>
            <Image src="/icons/nav/chevron-right-white.svg" alt="" width={20} height={20} unoptimized className="shrink-0" />
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          {links.map((link) => (
            <MenuLink key={link.id} link={link} onClose={onClose} />
          ))}
        </div>
        <div className="h-px w-full bg-[#EEEEEE]" />
        {guide && (
          <>
            <MenuLink link={guide} onClose={onClose} accent />
            <div className="h-px w-full bg-[#EEEEEE]" />
          </>
        )}
        <button type="button" onClick={onAuth} className={ROW}>
          <Tile src={auth.icon} />
          <span className="flex-1 text-base leading-6 text-[#212121]">{auth.label}</span>
        </button>
      </div>
    </div>,
    document.body,
  );
}
