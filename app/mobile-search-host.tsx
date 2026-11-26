"use client";

import { AnimatePresence } from "motion/react";

import { closeMobileSearch, useMobileSearchOpen } from "@/features/mobile-nav";
import { SearchSheetView, useSearchSheetViewModel } from "@/features/search";

// The one search sheet every phone search entry opens. AnimatePresence keeps it
// mounted while it slides away.
export function MobileSearchHost() {
  const open = useMobileSearchOpen();
  return <AnimatePresence>{open && <MobileSearchSheet key="search-sheet" />}</AnimatePresence>;
}

// Mounted per opening, so every search starts on a fresh sheet.
function MobileSearchSheet() {
  const vm = useSearchSheetViewModel({ onClose: closeMobileSearch });
  return <SearchSheetView {...vm} />;
}
