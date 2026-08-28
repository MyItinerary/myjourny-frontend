import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ExperienceCardProps } from "@/components/experiences/experience-card";
import { HeartRoundedIcon, StarIcon } from "@/components/icons/shared-icons";

// Figma: "Experience card" inside "Top picks right now" (2001:8528) — a
// different card shape from the horizontal `ExperienceCard` used in the
// rails ("Popular experiences near you" / "Based on your browsing
// history"): full-width photo, a save button, and a two-line price.
function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

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
  return (
    // relative + a lower z-index Link covering the card, so the save
    // button (higher z-index) stays independently clickable instead of
    // being nested inside the link (invalid HTML, breaks click handling).
    <article className={cn("relative flex w-full flex-col gap-3", className)}>
      {id && (
        <Link href={`/experiences/${id}`} className="absolute inset-0 z-0" aria-label={title} />
      )}

      {/* Figma keeps the photo a fixed 212px tall in every desktop context
          (345px rail cards and 277.5px category-grid cards alike). */}
      <div className="relative aspect-[345/212] w-full overflow-hidden rounded-2xl bg-muted lg:aspect-auto lg:h-[212px]">
        <Image src={imageSrc} alt={imageAlt} fill sizes="345px" className="object-cover" />
        <button
          type="button"
          aria-label="Save experience"
          className="absolute top-[13px] right-[13px] z-10 flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:text-brand"
        >
          <HeartRoundedIcon className="size-5" />
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

        <p className="font-heading text-foreground">
          <span className="block text-base font-normal text-muted-foreground">from</span>
          <span className="text-xl font-medium">{formatPrice(priceFrom, currency)}</span>
        </p>
      </div>
    </article>
  );
}
