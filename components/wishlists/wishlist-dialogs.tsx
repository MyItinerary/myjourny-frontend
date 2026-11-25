"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 50;

// The same motion as the site's other bottom sheets (search, filters, dates): up in 250ms,
// down in 200ms, the backdrop fading alongside. From sm up it's a centred card that rises a little.
const SHEET_IN = { duration: 0.25, ease: [0.2, 0, 0, 1] as const };
const SHEET_OUT = { duration: 0.2, ease: [0.4, 0, 1, 1] as const };
const FADE = { duration: 0.15 };

/** Render it inside AnimatePresence (as the dialogs below do) so it can slide away when closed. */
export function WishlistDialogShell({
  title,
  onClose,
  className,
  children,
}: {
  title: string;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [wide] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(min-width: 640px)").matches);
  const hidden = reduce ? { opacity: 0 } : wide ? { opacity: 0, y: 16 } : { y: "100%" };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        aria-hidden
        onMouseDown={onClose}
        className="absolute inset-0 bg-[rgba(18,18,18,0.3)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: reduce ? FADE : SHEET_IN }}
        exit={{ opacity: 0, transition: reduce ? FADE : SHEET_OUT }}
      />
      <motion.div
        initial={hidden}
        animate={{ opacity: 1, y: 0, transition: reduce ? FADE : SHEET_IN }}
        exit={{ ...hidden, transition: reduce ? FADE : SHEET_OUT }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative max-h-[85dvh] w-full overflow-y-auto rounded-t-[20px] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:max-h-[90vh] sm:rounded-[20px] sm:p-[30px]",
          className
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex-1 text-center text-lg font-semibold text-[#333134] sm:text-xl">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#212121] hover:bg-[#F5F5F5]"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// The site's standard 48px pill buttons (Button size="cta"), side by side.
const ACTION = "flex-1";
// Name, rename and delete are short asks, so the card stays small.
const SMALL_DIALOG = "max-w-[440px] sm:p-6";

function NameForm({
  title,
  initialName,
  submitLabel,
  pending,
  onSubmit,
  onClose,
}: {
  title: string;
  initialName: string;
  submitLabel: string;
  pending: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  const canSubmit = !!trimmed && !pending;

  return (
    <WishlistDialogShell title={title} onClose={onClose} className={SMALL_DIALOG}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit(trimmed);
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <Input
            size="cta"
            autoFocus
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter wishlist name"
            aria-label="Wishlist name"
            className="text-[#333134]"
          />
          <p className="px-4 text-xs text-[#6F6B72]">
            {name.length}/{MAX_NAME_LENGTH}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="cta" onClick={onClose} className={ACTION}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" size="cta" disabled={!canSubmit} className={ACTION}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </WishlistDialogShell>
  );
}

// Create and rename share one dialog (Figma only has the create variant);
// the form is mounted only while open so it re-seeds from `initialName`.
export function NameWishlistDialog({
  open,
  ...rest
}: {
  open: boolean;
  title: string;
  initialName?: string;
  submitLabel: string;
  pending: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}) {
  // `propagate`: when a parent (the save modal) closes it by unmounting, it still slides away.
  return <AnimatePresence propagate>{open && <NameForm key="name" {...rest} initialName={rest.initialName ?? ""} />}</AnimatePresence>;
}

type DeleteWishlistDialogProps = {
  open: boolean;
  name: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function DeleteWishlistDialog({ open, ...rest }: DeleteWishlistDialogProps) {
  return <AnimatePresence propagate>{open && <DeleteConfirm key="delete" {...rest} />}</AnimatePresence>;
}

function DeleteConfirm({ name, pending, onConfirm, onClose }: Omit<DeleteWishlistDialogProps, "open">) {
  return (
    <WishlistDialogShell title="Delete wishlist" onClose={onClose} className={SMALL_DIALOG}>
      <p className="mb-5 text-center text-sm text-[#6F6B72] sm:text-base">
        &ldquo;{name}&rdquo; and its saved experiences will be removed from your wishlists. This can&apos;t be
        undone.
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="cta" onClick={onClose} className={ACTION}>
          Cancel
        </Button>
        <Button type="button" variant="brand" size="cta" disabled={pending} onClick={onConfirm} className={ACTION}>
          {pending ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </WishlistDialogShell>
  );
}
