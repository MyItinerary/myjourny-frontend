"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 50;

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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,18,18,0.3)] p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-[20px] bg-white p-5 sm:p-[30px]",
          className
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex-1 text-center text-xl font-semibold text-[#333134] sm:text-2xl">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#212121] hover:bg-[#F5F5F5]"
          >
            <X className="size-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const outlineButton =
  "flex-1 cursor-pointer rounded-full border border-[#40000B] px-4 py-[18px] text-xl font-medium text-[#40000B] transition-colors hover:bg-[#40000B]/5 sm:text-2xl";

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
    <WishlistDialogShell title={title} onClose={onClose} className="max-w-[662px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit(trimmed);
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter wishlist name"
            aria-label="Wishlist name"
            className="h-[72px] w-full rounded-full bg-[#F4F2EE] px-4 text-xl font-medium text-[#333134] placeholder:text-[#858585] focus:outline-none focus:ring-2 focus:ring-[#40000B]/30"
          />
          <p className="text-sm text-[#6F6B72]">
            {name.length}/{MAX_NAME_LENGTH}
          </p>
        </div>
        <div className="flex gap-5">
          <button type="button" onClick={onClose} className={outlineButton}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "flex-1 rounded-full px-4 py-[18px] text-xl font-medium transition-colors sm:text-2xl",
              canSubmit
                ? "cursor-pointer bg-[#F5032D] text-white hover:bg-[#d90227]"
                : "cursor-not-allowed bg-[#F5F5F5] text-[#BDBDBD]"
            )}
          >
            {pending ? "Saving..." : submitLabel}
          </button>
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
  if (!open) return null;
  return <NameForm {...rest} initialName={rest.initialName ?? ""} />;
}

export function DeleteWishlistDialog({
  open,
  name,
  pending,
  onConfirm,
  onClose,
}: {
  open: boolean;
  name: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <WishlistDialogShell title="Delete wishlist" onClose={onClose} className="max-w-[662px]">
      <p className="mb-5 text-center text-base text-[#6F6B72]">
        &ldquo;{name}&rdquo; and its saved experiences will be removed from your wishlists. This can&apos;t be
        undone.
      </p>
      <div className="flex gap-5">
        <button type="button" onClick={onClose} className={outlineButton}>
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className="flex-1 cursor-pointer rounded-full bg-[#F5032D] px-4 py-[18px] text-xl font-medium text-white transition-colors hover:bg-[#d90227] disabled:opacity-60 sm:text-2xl"
        >
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </WishlistDialogShell>
  );
}
