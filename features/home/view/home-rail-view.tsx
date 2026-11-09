import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ExperienceCardVertical } from "@/components/experiences/experience-card-vertical";
import { ExperienceCardVerticalSkeleton } from "@/components/experiences/experience-card-vertical-skeleton";
import type { ExperienceCardProps } from "@/components/experiences/experience-card";

export type HomeRailViewProps = {
  heading: string;
  /** Greyed lead-in shown before the heading ("Local food & drinks" + "experiences"). */
  mutedHeading?: string;
  items: ExperienceCardProps[];
  isLoading?: boolean;
  /** Shows the red "See more" button under the rail. */
  seeMoreHref?: string;
};

// Figma "Popular experiences near you" rail (671:25400): a 1256px column with
// 345px cards 48px apart that bleed past the right margin, grey/red arrows
// beside the heading and an optional centred "See more".
export function HomeRailView({ heading, mutedHeading, items, isLoading = false, seeMoreHref }: HomeRailViewProps) {
  return (
    <section className="w-full overflow-x-clip bg-white">
      <div className="mx-auto w-full max-w-[1512px] px-6 py-10 lg:px-32 lg:py-[53px]">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-sans text-[28px] font-extrabold leading-[120%] text-[#333134]">
              {mutedHeading ? (
                <>
                  <span className="text-[#6F6B72]">{mutedHeading}</span>{" "}
                </>
              ) : null}
              {heading}
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              <CarouselPrevious className="static size-10 translate-y-0 border-0 bg-[#fafafa] text-foreground hover:bg-muted" />
              <CarouselNext className="static size-10 translate-y-0 border-0 bg-brand text-white hover:bg-brand/90" />
            </div>
          </div>

          {/* The cards run to the viewport edge, not the content column. */}
          <div className="-mr-6 mt-4 lg:-mr-[max(8rem,calc((100vw-1512px)/2+8rem))] lg:mt-6">
            {isLoading ? (
              <div className="flex gap-6 overflow-hidden lg:gap-12">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ExperienceCardVerticalSkeleton key={index} className="w-[345px] shrink-0" />
                ))}
              </div>
            ) : (
              <CarouselContent className="-ml-6 lg:-ml-12">
                {items.map((item, index) => (
                  <CarouselItem
                    key={item.id ?? `${item.title}-${index}`}
                    className="basis-[85%] pl-6 sm:basis-[369px] lg:basis-[393px] lg:pl-12"
                  >
                    <ExperienceCardVertical {...item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            )}
          </div>
        </Carousel>

        {seeMoreHref ? (
          <div className="mt-12 flex justify-center">
            <Button
              size="cta"
              render={<Link href={seeMoreHref} />}
              className="w-[134px] bg-[#F5032D] text-white hover:bg-[#d90328]"
            >
              See more
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
