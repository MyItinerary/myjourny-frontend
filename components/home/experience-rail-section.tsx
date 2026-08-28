import Link from "next/link";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ExperienceCard } from "@/components/experiences/experience-card";
import { ExperienceCardSkeleton } from "@/components/experiences/experience-card-skeleton";
import { ExperienceCardVertical } from "@/components/experiences/experience-card-vertical";
import { ExperienceCardVerticalSkeleton } from "@/components/experiences/experience-card-vertical-skeleton";
import type { ExperienceItem } from "@/lib/mock-data/home";
import { cn } from "@/lib/utils";

// One reusable rail for the 3 experience sections on the homepage, with two
// distinct layouts per Figma at each breakpoint:
// - Horizontal cards ("Popular experiences near you", 2001:9145 desktop /
//   2001:9171 mobile): desktop is a STATIC 2-col × 3-row grid in the 900px
//   column (no carousel, no arrows); mobile is 3 horizontally-scrollable
//   rows of 360px cards (12px card gap, 24px row gap) under a CENTERED
//   heading block.
// - Vertical cards ("Top picks right now" 2001:8517 / "Based on your
//   browsing history" 2001:9149 + category-page "Other experiences"): a
//   carousel of 345px cards with 34px gaps (24px on mobile) that bleeds
//   past the page margin. Arrows sit top-right of the header on desktop and
//   under the subtitle (left) on mobile — grey + brand circles.
interface ExperienceRailSectionProps {
  heading: string;
  subheading?: string;
  items: ExperienceItem[];
  cardVariant?: "horizontal" | "vertical";
  seeMoreHref?: string;
  /** Category page uses the wider 1212px column (150px side margins). */
  wide?: boolean;
  className?: string;
  /** Renders skeleton cards in place of `items` — same wrapper markup, no layout shift once real data arrives. */
  isLoading?: boolean;
}

function chunk<T>(list: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size));
  return rows;
}

export function ExperienceRailSection({
  heading,
  subheading,
  items,
  cardVariant = "horizontal",
  seeMoreHref,
  wide = false,
  className,
  isLoading = false,
}: ExperienceRailSectionProps) {
  const headingBlock = (center: boolean) => (
    <div
      className={cn(
        "flex flex-col gap-4 lg:gap-[15px]",
        center && "items-center text-center lg:items-start lg:text-left"
      )}
    >
      <h2 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:max-w-[688px] lg:text-[40px]">
        {heading}
      </h2>
      {subheading ? (
        <p className="text-lg leading-[28px] text-muted-foreground lg:text-xl lg:leading-[30px]">{subheading}</p>
      ) : null}
    </div>
  );

  if (cardVariant === "vertical") {
    return (
      <section
        className={cn(
          "mx-auto w-full max-w-[1512px] px-6 pt-[77px] pb-[77px] lg:pb-[79px]",
          wide ? "lg:px-[150px]" : "lg:px-[306px]",
          className
        )}
      >
        <Carousel opts={{ align: "start", dragFree: true }}>
          <div className="flex flex-col gap-[15px] lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            {headingBlock(false)}
            <div className="flex shrink-0 items-center gap-1">
              <CarouselPrevious className="static size-10 translate-y-0 border-0 bg-[#fafafa] text-foreground hover:bg-muted" />
              <CarouselNext className="static size-10 translate-y-0 border-0 bg-brand text-white hover:bg-brand/90" />
            </div>
          </div>
          {/* Bleeds past the right page margin like the design (cards clip at
              the viewport edge, not at the content column). */}
          <div className={cn("mt-[34px] -mr-6", wide ? "lg:-mr-[150px]" : "lg:-mr-[306px]")}>
            {isLoading ? (
              // Skeletons don't need to be draggable/scrollable — skip the
              // Carousel machinery entirely and just render a plain row.
              <div className="flex gap-6 overflow-hidden lg:gap-[34px]">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ExperienceCardVerticalSkeleton key={index} className="w-[345px] shrink-0" />
                ))}
              </div>
            ) : (
              /* basis includes the pl gap: 345px card + 24px (mobile) / 34px (lg) */
              <CarouselContent className="-ml-6 lg:-ml-[34px]">
                {items.map((item) => (
                  <CarouselItem key={item.id} className="basis-[369px] pl-6 lg:basis-[379px] lg:pl-[34px]">
                    <ExperienceCardVertical {...item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            )}
          </div>
        </Carousel>
      </section>
    );
  }

  return (
    <section className={cn("mx-auto w-full max-w-[1512px] px-6 py-[42px] lg:px-[306px] lg:pt-[77px] lg:pb-[140px]", className)}>
      <div className="flex items-start justify-between gap-4">
        {headingBlock(true)}
        {seeMoreHref ? (
          <Link
            href={seeMoreHref}
            className="hidden shrink-0 items-center gap-2 text-base font-medium text-brand lg:flex"
          >
            See more
          </Link>
        ) : null}
      </div>

      {/* Mobile: 3 horizontally-scrollable rows of 360px cards; desktop: the
          design's static 2-col grid. */}
      <div className="mt-6 flex flex-col gap-6 lg:hidden">
        {isLoading
          ? chunk(Array.from({ length: 6 }), 2).map((row, index) => (
              <div key={index} className="-mr-6 flex gap-3 overflow-hidden pr-6">
                {row.map((_, itemIndex) => (
                  <ExperienceCardSkeleton key={itemIndex} className="w-[360px] shrink-0 p-0" />
                ))}
              </div>
            ))
          : chunk(items, 2).map((row, index) => (
              <div key={index} className="-mr-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pr-6">
                {row.map((item) => (
                  <ExperienceCard key={item.id} {...item} className="w-[360px] shrink-0 snap-start p-0" />
                ))}
              </div>
            ))}
      </div>
      <div className="mt-[31px] hidden grid-cols-2 gap-x-6 gap-y-[31px] lg:grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <ExperienceCardSkeleton key={index} />)
          : items.map((item) => <ExperienceCard key={item.id} {...item} />)}
      </div>
    </section>
  );
}
