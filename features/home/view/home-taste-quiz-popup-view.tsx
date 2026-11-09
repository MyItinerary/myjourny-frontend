"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import type { TasteQuizPopupViewModel } from "../view-model/use-taste-quiz-popup-view-model";

// Figma "Experience card" popup (741:18842): a white card pinned bottom-right
// that offers the taste quiz once the visitor has scrolled down the page.
// On a phone it sits above the bottom tab bar.
export function HomeTasteQuizPopupView({ visible, href, onDismiss }: TasteQuizPopupViewModel) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="complementary"
          aria-label="Personalise your feed"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed right-4 bottom-24 z-40 w-[333px] max-w-[calc(100vw-32px)] rounded-[17.5px] bg-white p-[23px] shadow-[0_12px_44px_rgba(0,0,0,0.18)] lg:right-6 lg:bottom-6"
        >
          <div className="flex flex-col gap-[18px]">
            <div className="flex items-center gap-2">
              <Image src="/icons/home/stars-01.svg" alt="" width={16} height={16} unoptimized />
              <p className="font-sans text-xs font-medium leading-[18px] text-[#F5032D]">This page can match your taste</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-sans text-base font-medium leading-6 text-[#333134]">
                Right now you&rsquo;re seeing what everyone else sees.
              </h2>
              <p className="font-sans text-sm leading-[22px] text-[#6F6B72]">
                Five questions, about 40 seconds, and this page starts looking like yours.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={href}
                className="inline-flex h-11 w-full items-center justify-center rounded-[200px] bg-[#F5032D] px-4 py-3 font-sans text-sm font-medium leading-[21px] text-white transition-colors hover:bg-[#d90328]"
              >
                Take it
              </Link>
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[200px] border border-[#2C0101] bg-transparent px-4 py-3 font-sans text-sm font-medium leading-[21px] text-[#2C0101] transition-colors hover:bg-[#2C0101]/5"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
