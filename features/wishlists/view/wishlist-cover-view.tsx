import Image from "next/image";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

import type { WishlistCoverLayout } from "../model/wishlist-covers.types";

/** A collection's cover (after Airbnb's wishlist cards): one experience's image, or a 2×2 grid of the first four. */
export function WishlistCoverView({ cover, className }: { cover: WishlistCoverLayout; className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[21/20] w-full overflow-hidden rounded-[20px] bg-[#F4F2EE] shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {cover.kind === "single" && cover.src && (
        <Image src={cover.src} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
      )}
      {cover.kind === "grid" && (
        <div data-testid="cover-grid" className="grid size-full grid-cols-2 grid-rows-2 gap-1.5 bg-white">
          {cover.tiles.map((src, i) => (
            <div key={i} className="relative overflow-hidden bg-[#E0DFDD]">
              {src && <Image src={src} alt="" fill sizes="(min-width: 1024px) 12vw, (min-width: 640px) 25vw, 50vw" className="object-cover" />}
            </div>
          ))}
        </div>
      )}
      {cover.kind === "empty" && (
        <div className="flex size-full items-center justify-center">
          <Heart aria-hidden className="size-10 text-[#BDBDBD]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
