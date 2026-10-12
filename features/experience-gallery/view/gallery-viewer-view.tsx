"use client";

import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryViewerProps = {
  open: boolean;
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

const ROUND_BUTTON =
  "flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20";

/** Full-screen photo viewer: one photo at a time, with arrows (or the arrow
 * keys) to step through and Escape to close. */
export function GalleryViewerView({ open, images, index, alt, onClose, onNext, onPrevious }: GalleryViewerProps) {
  const total = images.length;
  const src = images[index];
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/90" />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col outline-none"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") onNext();
            if (event.key === "ArrowLeft") onPrevious();
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <Dialog.Title className="text-sm font-medium">
              Photo {index + 1} of {total}
            </Dialog.Title>
            <Dialog.Close aria-label="Close photos" className={ROUND_BUTTON}>
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 items-center gap-2 px-2 pb-4 sm:gap-4 sm:px-4">
            {total > 1 && (
              <button type="button" aria-label="Previous photo" onClick={onPrevious} className={`${ROUND_BUTTON} shrink-0`}>
                <ChevronLeft className="size-5" />
              </button>
            )}
            <div className="relative h-full min-w-0 flex-1">
              {src && (
                <Image
                  key={src}
                  src={src}
                  alt={`${alt}, photo ${index + 1} of ${total}`}
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                />
              )}
            </div>
            {total > 1 && (
              <button type="button" aria-label="Next photo" onClick={onNext} className={`${ROUND_BUTTON} shrink-0`}>
                <ChevronRight className="size-5" />
              </button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
