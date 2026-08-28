"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";

// Desktop: one large photo (2/3 width) + 2 stacked smaller photos (1/3),
// with a "View all" pill overlaid on the last one. Mobile: a single
// full-width hero photo — matches the screenshots shared for this page
// (no Figma access yet, see lib/queries/experiences.ts's ExperienceDetail
// comment).
export function ExperienceGallery({ images, alt }: { images: string[]; alt: string }) {
  const [main, ...rest] = images;
  const secondary = rest.slice(0, 2);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted lg:col-span-2 lg:aspect-auto lg:h-[352px]">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            unoptimized
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="hidden grid-rows-2 gap-3 lg:grid">
        {[0, 1].map((index) => {
          const src = secondary[index];
          const isLast = index === 1;
          return (
            <div key={index} className="relative h-[170px] w-full overflow-hidden rounded-2xl bg-muted">
              {src && <Image src={src} alt={alt} fill unoptimized sizes="33vw" className="object-cover" />}
              {isLast && images.length > 0 && (
                <button
                  type="button"
                  className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm"
                >
                  <LayoutGrid className="size-3.5" />
                  View all
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
