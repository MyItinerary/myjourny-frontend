import Image from "next/image";

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import type { PosterEvent } from "../model/discovery-events.types";
import { RailHeaderView } from "./rail-header-view";

// Figma "Poster card / Desktop / Flyer" (2654:59834): a 313×450 dark card, the poster fading into it.
function EventPosterCardView({ event }: { event: PosterEvent }) {
  return (
    <article className="relative flex h-[450px] w-full flex-col items-center justify-end overflow-hidden rounded-[20px] bg-[#130404] px-[18px] pb-[22px] text-center">
      <div className="absolute inset-x-0 top-0 h-[240px]">
        <Image src={event.imageSrc} alt="" fill sizes="313px" className="object-cover" />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[255px] bg-gradient-to-b from-[rgba(19,4,4,0)] from-[72%] via-[rgba(19,4,4,0.55)] via-[88%] to-[#130404]"
      />
      <div className="relative flex w-full flex-col items-center gap-[10px]">
        <div className="flex w-full flex-col items-center gap-2">
          <p className="w-full text-[12px] leading-4 font-semibold tracking-[0.72px] text-[#ffeccb] uppercase">{event.category}</p>
          <h3 className="w-full font-sans text-[20px] leading-[25px] font-extrabold tracking-[-0.2px] text-white">{event.title}</h3>
        </div>
        <div className="flex w-full flex-col items-center gap-1">
          <p className="text-[15px] leading-5 font-medium text-white">{event.dateLabel}</p>
          <p className="w-full text-sm leading-5 text-white/66">{event.priceLabel}</p>
        </div>
      </div>
    </article>
  );
}

export function EventPosterRailView({ heading, events }: { heading: string; events: PosterEvent[] }) {
  return (
    <section aria-label={heading} className="w-full overflow-x-clip bg-white">
      <div className="mx-auto w-full max-w-[1512px] px-6 py-10 lg:px-32 lg:py-[53px]">
        <Carousel opts={{ align: "start", dragFree: true }}>
          <RailHeaderView heading={heading} />
          <div className="-mr-6 mt-4 lg:-mr-[max(8rem,calc((100vw-1512px)/2+8rem))] lg:mt-9">
            <CarouselContent className="-ml-4 lg:-ml-6">
              {events.map((event) => (
                <CarouselItem key={event.id} className="basis-[313px] pl-4 lg:pl-6">
                  <EventPosterCardView event={event} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
