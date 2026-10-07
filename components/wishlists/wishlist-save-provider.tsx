"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { SaveToCollectionModal } from "@/components/wishlists/save-to-collection-modal";

type Target = { experienceId: string; title?: string };

const WishlistSaveContext = createContext<{ openSave: (experienceId: string, title?: string) => void } | null>(
  null
);

// One save-to-wishlist dialog for the whole app, so any heart icon can
// open it without each card mounting its own modal.
export function WishlistSaveProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<Target | null>(null);
  const openSave = useCallback((experienceId: string, title?: string) => setTarget({ experienceId, title }), []);
  const value = useMemo(() => ({ openSave }), [openSave]);

  return (
    <WishlistSaveContext.Provider value={value}>
      {children}
      {target && (
        <SaveToCollectionModal
          experienceId={target.experienceId}
          experienceTitle={target.title}
          isOpen
          onClose={() => setTarget(null)}
        />
      )}
    </WishlistSaveContext.Provider>
  );
}

export function useWishlistSave() {
  const ctx = useContext(WishlistSaveContext);
  if (!ctx) throw new Error("useWishlistSave must be used inside WishlistSaveProvider");
  return ctx;
}
