"use client";

import Image from "next/image";
import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import type { SearchSheetViewModel } from "../view-model/use-search-sheet-view-model";
import { WhenCardView, WhoCardView } from "./search-sheet-when-view";
import { WhereCardView } from "./search-sheet-where-view";

// Motion (Figma 2726:6927 "Motion"): the sheet slides up in 250ms and down in 200ms while the page
// behind dims and blurs; a card opens or closes in 200ms and its content fades in 80ms later.
// Reduced motion: the sheet cross-fades in 150ms and cards swap instantly.
const SHEET_IN = { duration: 0.25, ease: [0.2, 0, 0, 1] as const };
const SHEET_OUT = { duration: 0.2, ease: [0.4, 0, 1, 1] as const };
const FADE = { duration: 0.15 };
const CARD = { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

const OPEN_SHADOW = "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_12px_32px_-16px_rgba(44,1,1,0.18)]";
const WHO_SHADOW = "shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_12px_32px_0px_rgba(44,1,1,0.18)]";

/** The phone search sheet (Figma 2726:7167). Render it inside AnimatePresence so it can slide away. */
export function SearchSheetView(vm: SearchSheetViewModel) {
  const reduce = useReducedMotion();
  const { openCard, editing } = vm;

  return createPortal(
    <div className="lg:hidden">
      <motion.div
        aria-hidden
        className="fixed inset-0 z-[70] bg-[rgba(20,18,21,0.4)] backdrop-blur-[20px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: reduce ? FADE : SHEET_IN }}
        exit={{ opacity: 0, transition: reduce ? FADE : SHEET_OUT }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="fixed inset-x-0 top-0 z-[70] flex h-dvh flex-col bg-[rgba(240,238,234,0.9)] pt-[env(safe-area-inset-top)]"
        style={vm.viewportHeight ? { height: vm.viewportHeight } : undefined}
        initial={reduce ? { opacity: 0 } : { y: "100%" }}
        animate={reduce ? { opacity: 1, transition: FADE } : { y: 0, transition: SHEET_IN }}
        exit={reduce ? { opacity: 0, transition: FADE } : { y: "100%", transition: SHEET_OUT }}
      >
        <div className="flex h-[60px] shrink-0 items-center justify-between pr-4 pl-6">
          <p className="text-base font-medium text-[#333134]">Search</p>
          <button
            type="button"
            aria-label="Close search"
            onClick={vm.onClose}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white drop-shadow-[0px_2px_5px_rgba(44,1,1,0.12)]"
          >
            <Image src="/icons/nav/close.svg" alt="" width={20} height={20} unoptimized />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-[10px] px-4 pt-1 pb-3">
          <Card open={openCard === "where"} fill shadow={OPEN_SHADOW} reduce={reduce} label="Where" value={vm.whereSummary} onOpen={() => vm.onOpenCard("where")}>
            <WhereCardView {...vm} />
          </Card>
          {/* When and Who step aside while typing, so the matches get the room above the keyboard. */}
          {!editing && (
            <>
              <Card open={openCard === "when"} fill shadow={OPEN_SHADOW} reduce={reduce} label="When" value={vm.whenSummary} onOpen={() => vm.onOpenCard("when")}>
                <WhenCardView {...vm} />
              </Card>
              <Card open={openCard === "who"} shadow={WHO_SHADOW} reduce={reduce} label="Who" value={vm.whoSummary} onOpen={() => vm.onOpenCard("who")}>
                <WhoCardView {...vm} />
              </Card>
            </>
          )}
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-t border-[#E0DFDD] bg-[#F4F2EE] pr-4 pl-6",
            editing ? "py-2.5" : "pt-[14px] pb-[max(14px,env(safe-area-inset-bottom))]",
          )}
        >
          <button type="button" onClick={vm.onClearAll} className="flex min-h-11 cursor-pointer items-center text-base font-medium text-[#333134] underline">
            Clear all
          </button>
          <button
            type="button"
            onClick={vm.onSearch}
            aria-busy={vm.searching}
            className="flex h-[52px] cursor-pointer items-center gap-2 rounded-full bg-brand pr-[26px] pl-[22px] text-base font-medium text-white active:bg-[#C80024]"
          >
            {/* The spinner takes the icon's place, so the button keeps its width while loading. */}
            {vm.searching ? (
              <span aria-hidden className="m-0.5 size-4 animate-spin rounded-full border-2 border-white/35 border-t-white [animation-duration:0.8s]" />
            ) : (
              <Image src="/icons/search/search-white.svg" alt="" width={20} height={20} unoptimized />
            )}
            Search
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

/** A Where/When/Who card: a 56px row while closed, the full card while open. */
function Card({
  open,
  fill = false,
  shadow,
  reduce,
  label,
  value,
  onOpen,
  children,
}: {
  open: boolean;
  /** Where and When fill the space above the footer when open; Who sizes to its content. */
  fill?: boolean;
  /** The open card's shadow, on the card itself so its rounded clip doesn't cut it off. */
  shadow: string;
  reduce: boolean | null;
  label: string;
  value: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <motion.section
      layout={!reduce}
      transition={CARD}
      aria-label={label}
      style={{ borderRadius: open ? 24 : 16 }}
      className={cn("shrink-0 overflow-hidden bg-white", open ? cn(fill && "min-h-0 flex-1", "flex flex-col", shadow) : "drop-shadow-[0px_1px_1px_rgba(16,24,40,0.05)]")}
    >
      {open ? (
        <motion.div
          key="open"
          layout={!reduce}
          className="flex min-h-0 flex-1 flex-col"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.08, duration: 0.12 } }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.button
          key="closed"
          layout={!reduce ? "position" : false}
          type="button"
          aria-expanded={false}
          onClick={onOpen}
          className="flex h-14 w-full cursor-pointer items-center justify-between px-5 text-[15px]"
        >
          <span className="text-[#6F6B72]">{label}</span>{" "}
          <span className="font-medium text-[#333134]">{value}</span>
        </motion.button>
      )}
    </motion.section>
  );
}

