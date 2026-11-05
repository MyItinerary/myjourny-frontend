import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import type { DiscoverEvent } from "../model/discovery-events.types";
import { RailHeaderView } from "./rail-header-view";

// Figma "Discover/Card" (2654:61235) as an event: photo with a date chip, then the
// date line, title, place and price.
function DiscoverEventCardView({ event }: { event: DiscoverEvent }) {
  return (
    <article className="flex w-full flex-col gap-3">
      <div className="relative h-[230px] overflow-hidden rounded-2xl bg-[#e9e1d2] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
        <Image src={event.imageSrc} alt="" fill sizes="294px" className="object-cover" />
        <div className="absolute top-3 left-3 flex flex-col items-center gap-[3px] rounded-xl bg-white px-[10px] py-[6px] shadow-[0_1px_2px_rgba(16,24,40,0.12)]">
          <span className="text-[11px] leading-[11px] font-medium tracking-[0.66px] text-[#f5032d] uppercase">{event.month}</span>
          <span className="text-[22px] leading-[22px] font-extrabold text-[#333134]">{event.day}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-0.5">
        <p className="text-xs font-medium tracking-[0.72px] text-[#f5032d] uppercase">{event.whenLabel}</p>
        <h3 className="text-lg leading-6 font-medium text-[#333134]">{event.title}</h3>
        <p className="text-sm leading-5 text-[#6f6b72]">{event.location}</p>
        <p className="pt-0.5 text-[15px] font-medium text-[#333134]">{event.priceLabel}</p>
      </div>
    </article>
  );
}

type EventRailViewProps = {
  heading: string;
  events: DiscoverEvent[];
  /** Shows the red "See more" button under the rail. */
  seeMoreHref?: string;
};

export function EventRailView({ heading, events, seeMoreHref }: EventRailViewProps) {
  return (
    <section aria-label={heading} className="w-full overflow-x-clip bg-white">
      <div className="mx-auto w-full max-w-[1512px] px-6 py-10 lg:px-32 lg:py-[53px]">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <RailHeaderView heading={heading} />
          <div className="-mr-6 mt-4 lg:-mr-[max(8rem,calc((100vw-1512px)/2+8rem))] lg:mt-9">
            <CarouselContent className="-ml-4 lg:-ml-6">
              {events.map((event) => (
                <CarouselItem key={event.id} className="basis-[294px] pl-4 lg:pl-6">
                  <DiscoverEventCardView event={event} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>

        {seeMoreHref ? (
          <div className="mt-12 flex justify-center">
            <Button size="cta" render={<Link href={seeMoreHref} />} className="w-[134px] bg-[#F5032D] text-white hover:bg-[#d90328]">
              See more
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
