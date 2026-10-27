"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ExperienceGalleryViewModel } from "../view-model/use-experience-gallery-view-model";
import { GalleryViewerView } from "./gallery-viewer-view";

// Photos the desktop grid has room for: one large and four beside it.
const GRID_TILES = 5;

/** How a side photo spans the grid so no tile is left empty: with fewer than
 * four beside the large one, they stretch to fill the space. */
function tileSpan(sideCount: number, offset: number): string {
  if (sideCount === 1) return "row-span-2";
  if (sideCount === 2) return "row-span-2";
  if (sideCount === 3 && offset === 2) return "col-span-2";
  return "";
}

/** An experience's photos. Large screens get a grid of up to five with the
 * rest behind "View all"; small screens get a strip to swipe through. Any
 * photo opens the full-screen viewer. */
export function ExperienceGalleryView({ alt, ...vm }: ExperienceGalleryViewModel & { alt: string }) {
  const { images } = vm;
  if (images.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-2xl bg-muted lg:aspect-auto lg:h-[352px]" />;
  }
  const total = images.length;
  const label = (index: number) => `View photo ${index + 1} of ${total}`;
  const side = images.slice(1, GRID_TILES);

  return (
    <>
      <div data-testid="gallery-strip" className="relative lg:hidden">
        <div
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const strip = event.currentTarget;
            if (strip.clientWidth > 0) vm.onSlideChange(Math.round(strip.scrollLeft / strip.clientWidth));
          }}
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={label(index)}
              onClick={() => vm.onOpenViewer(index)}
              className="relative aspect-[4/3] w-full shrink-0 cursor-pointer snap-center bg-muted"
            >
              <Image src={src} alt={alt} fill unoptimized sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {total > 1 && (
          <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {vm.slideIndex + 1} / {total}
          </span>
        )}
      </div>

      <div
        data-testid="gallery-grid"
        className="relative hidden h-[479px] grid-cols-3 grid-rows-2 gap-4 lg:grid"
      >
        <button
          type="button"
          aria-label={label(0)}
          onClick={() => vm.onOpenViewer(0)}
          className={cn(
            "relative row-span-2 cursor-pointer overflow-hidden rounded-[20px] bg-muted",
            side.length === 0 && "col-span-3",
            side.length === 1 && "col-span-2",
          )}
        >
          <Image src={images[0]} alt={alt} fill unoptimized sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </button>

        {side.map((src, offset) => {
          const index = offset + 1;
          return (
            <button
              key={src}
              type="button"
              aria-label={label(index)}
              onClick={() => vm.onOpenViewer(index)}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-[20px] bg-muted",
                tileSpan(side.length, offset),
              )}
            >
              <Image src={src} alt={alt} fill unoptimized sizes="33vw" className="object-cover" />
            </button>
          );
        })}

        {total > GRID_TILES && (
          <button
            type="button"
            onClick={() => vm.onOpenViewer(0)}
            className="absolute right-3 bottom-3 flex h-[37px] cursor-pointer items-center gap-2 rounded-full bg-white px-2 font-sans text-[14px] font-medium text-[#333134] shadow-sm"
          >
            <ImageIcon className="size-5" />
            View all {total} photos
          </button>
        )}
      </div>

      <GalleryViewerView
        open={vm.viewerOpen}
        images={images}
        index={vm.viewerIndex}
        alt={alt}
        onClose={vm.onCloseViewer}
        onNext={vm.onNext}
        onPrevious={vm.onPrevious}
      />
    </>
  );
}
