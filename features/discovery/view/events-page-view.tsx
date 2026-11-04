import { NewsletterSection } from "@/components/home/newsletter-section";
import { Reveal } from "@/components/motion/reveal";
import { Footer } from "@/features/footer";

import type { EventsPageViewModel } from "../view-model/use-events-page-view-model";
import { CategoryPillsView } from "./category-pills-view";
import { DiscoveryHeroView } from "./discovery-hero-view";
import { EventPosterRailView } from "./event-poster-rail-view";
import { EventRailView } from "./event-rail-view";

// Figma "Events" (2656:72987).
export function EventsPageView({
  hero,
  popularToday,
  thisWeekend,
  earlyBird,
  basedOnSearch,
  pickedForYou,
  nextWeek,
  categories,
}: EventsPageViewModel) {
  return (
    <div className="flex w-full max-w-full flex-1 flex-col overflow-x-clip">
      <DiscoveryHeroView
        hero={hero}
        title="Events you won’t miss for anything"
        subtitle="Concerts, conferences, meetups, and nights out across Nigeria."
        titleWidth={628}
      />

      <Reveal>
        <EventPosterRailView heading="Popular events happening today" events={popularToday} />
      </Reveal>
      <Reveal>
        <EventRailView heading="This weekend" events={thisWeekend} seeMoreHref="/events" />
      </Reveal>
      <Reveal>
        <EventRailView heading="Early bird ending soon" events={earlyBird} />
      </Reveal>
      {basedOnSearch && (
        <Reveal>
          <EventRailView heading={`Based on your search in ${basedOnSearch.area}`} events={basedOnSearch.events} />
        </Reveal>
      )}
      {pickedForYou.length > 0 && (
        <Reveal>
          <EventRailView heading="Picked for your taste" events={pickedForYou} />
        </Reveal>
      )}
      <Reveal>
        <CategoryPillsView categories={categories} hrefBase="/events/categories" visibleCount={9} />
      </Reveal>
      <Reveal>
        <EventRailView heading="Happening Next week" events={nextWeek} />
      </Reveal>

      <Reveal>
        <NewsletterSection />
      </Reveal>
      <Reveal>
        <Footer />
      </Reveal>
    </div>
  );
}
