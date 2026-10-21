"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ExperienceCardProps } from "@/components/experiences/experience-card";
import { HeartRoundedIcon, StarIcon } from "@/components/icons/shared-icons";
import { formatPriceOrFree } from "@/features/booking";
import { useMyWishlistedIds } from "@/lib/queries/wishlists";
import { useWishlistSave } from "@/components/wishlists/wishlist-save-provider";

// Figma: "Experience card" inside "Top picks right now" (2001:8528) — a
// different card shape from the horizontal `ExperienceCard` used in the
// rails ("Popular experiences near you" / "Based on your browsing
// history"): full-width photo, a save button, and a two-line price.
export function ExperienceCardVertical({
  imageSrc,
  imageAlt,
  category,
  title,
  duration,
  rating,
  currency = "NGN",
  priceFrom,
  className,
  id,
}: ExperienceCardProps) {
  const { data: wishlistIds } = useMyWishlistedIds();
  const { openSave } = useWishlistSave();
  const isSaved = !!id && !!wishlistIds?.has(id);

  return (
    // relative + a lower z-index Link covering the card, so the save
    // button (higher z-index) stays independently clickable instead of
    // being nested inside the link (invalid HTML, breaks click handling).
    <article
      className={cn(
        "group relative flex w-full flex-col gap-3 transition-transform duration-300 hover:-translate-y-1",
        className
      )}
    >
      {id && (
        <Link href={`/experiences/${id}`} className="absolute inset-0 z-0 cursor-pointer" aria-label={title} />
      )}

      {/* Figma keeps the photo a fixed 212px tall in every desktop context
          (345px rail cards and 277.5px category-grid cards alike). */}
      <div className="pointer-events-none relative aspect-[345/212] w-full overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-lg lg:aspect-auto lg:h-[212px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          unoptimized
          sizes="345px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          aria-label={isSaved ? "Edit wishlists" : "Save to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            if (id) openSave(id, title);
          }}
          disabled={!id}
          className={cn(
            "pointer-events-auto absolute top-[13px] right-[13px] z-10 flex size-9 items-center justify-center rounded-full bg-white shadow-sm transition-colors cursor-pointer",
            isSaved ? "text-brand" : "text-foreground hover:text-brand"
          )}
        >
          <HeartRoundedIcon className={cn("size-5", isSaved && "fill-brand")} />
        </button>
      </div>

      <div className="pointer-events-none flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brand">{category}</span>
          <h3 className="font-heading line-clamp-2 text-lg font-medium text-foreground">{title}</h3>
          <div className="flex items-center gap-1.5 text-base text-muted-foreground">
            <span>{duration}</span>
            <span aria-hidden className="size-1 rounded-full bg-muted-foreground/50" />
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="size-[22px] fill-brand text-brand" />
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        {priceFrom !== null && (
          <p className="font-heading text-foreground">
            {priceFrom > 0 && <span className="block text-base font-normal text-muted-foreground">from</span>}
            <span className="text-xl font-medium">{formatPriceOrFree(priceFrom, currency)}</span>
          </p>
        )}
      </div>
    </article>
  );
}
