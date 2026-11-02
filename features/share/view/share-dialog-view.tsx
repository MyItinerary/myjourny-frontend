"use client";

import Image from "next/image";
import { Check, Copy, Mail, MessageSquare, MoreHorizontal, Send, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import type { ShareTarget } from "../model/share.types";
import type { ShareDialogViewModel } from "../view-model/use-share-dialog-view-model";

const ICONS: Record<ShareTarget["id"], ReactNode> = {
  email: <Mail className="size-6" aria-hidden />,
  messages: <MessageSquare className="size-6" aria-hidden />,
  // The WhatsApp mark from the design (public/icons/share/whatsapp.svg), at its own 24px size.
  whatsapp: <Image src="/icons/share/whatsapp.svg" alt="" width={24} height={24} className="size-6" unoptimized />,
  messenger: <Send className="size-6" aria-hidden />,
  facebook: (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const button =
  "flex h-[66px] w-full cursor-pointer items-center gap-4 rounded-2xl border border-[#E0DFDD] bg-white px-4 text-left font-sans text-base font-medium text-[#333134] transition-colors hover:bg-[#F4F2EE]";

/** The share dialog: the listing, then copy link, email, messages and the
 * other places to send it. A bottom sheet on phones, a dialog on large screens. */
export function ShareDialogView(vm: ShareDialogViewModel) {
  const { open, onClose } = vm;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(18,18,18,0.4)] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share"
        className="animate-in slide-in-from-bottom max-h-[92vh] w-full max-w-[568px] overflow-y-auto rounded-t-[24px] bg-white p-6 duration-300 sm:rounded-[24px] sm:p-8"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full text-[#212121] hover:bg-[#F5F5F5]"
        >
          <X className="size-6" />
        </button>

        <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#333134] sm:text-[32px]">Share {vm.title}</h2>

        <div className="mt-6 flex items-center gap-5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#E9E1D2] sm:size-20">
            {vm.imageUrl && <Image src={vm.imageUrl} alt="" fill unoptimized sizes="80px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-sans text-lg leading-7 text-[#333134] sm:text-xl">{vm.message}</p>
            {vm.hasReferral && (
              <p className="mt-1 font-sans text-sm text-[#6F6B72]">Your referral code is included in this link.</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" onClick={vm.onCopy} className={button}>
            {vm.copied ? <Check className="size-6" aria-hidden /> : <Copy className="size-6" aria-hidden />}
            {vm.copied ? "Copied" : "Copy link"}
          </button>
          {vm.targets.map((target) => (
            <a key={target.id} href={target.href} target="_blank" rel="noopener noreferrer" className={button}>
              {ICONS[target.id]}
              {target.label}
            </a>
          ))}
          <button type="button" onClick={vm.onMoreOptions} className={button}>
            <MoreHorizontal className="size-6" aria-hidden />
            More options
          </button>
        </div>
      </div>
    </div>
  );
}
