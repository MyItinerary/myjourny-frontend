import { Reveal } from "@/components/motion/reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Footer } from "@/components/home/footer";

import type { HomeViewModel } from "../view-model/use-home-view-model";
import { HomeBrowseView } from "./home-browse-view";
import { HomeCitiesView } from "./home-cities-view";
import { HomeHeroView } from "./home-hero-view";
import { HomeRailView } from "./home-rail-view";
import { HomeTasteQuizBandView } from "./home-taste-quiz-band-view";
import { HomeWhyBookView } from "./home-why-book-view";

// Figma "Home" (671:24717). Section order follows the design; rails with
// nothing to show are left out. "Discover by categories" lives on the
// experiences and events pages, not here.
export function HomeView({
  hero,
  happeningNear,
  popularEvents,
  topPicks,
  exploreLagos,
  cultureAndHistory,
  localFoodAndDrinks,
  unforgettableTravel,
  browsingHistory,
  tasteQuiz,
  cities,
}: HomeViewModel) {
  return (
    <div className="flex w-full max-w-full flex-1 flex-col overflow-x-clip">
      <HomeHeroView {...hero} />

      <Reveal>
        <HomeWhyBookView />
      </Reveal>

      {happeningNear.show && (
        <Reveal>
          <HomeRailView
            heading="Happening near you"
            items={happeningNear.items}
            isLoading={happeningNear.isLoading}
            seeMoreHref="/popular-experiences"
          />
        </Reveal>
      )}

      {popularEvents.show && (
        <Reveal>
          <HomeRailView
            heading="Popular events you should check out"
            items={popularEvents.items}
            isLoading={popularEvents.isLoading}
            seeMoreHref="/events"
          />
        </Reveal>
      )}

      {topPicks.show && (
        <Reveal>
          <HomeRailView heading="Top picks right now" items={topPicks.items} isLoading={topPicks.isLoading} />
        </Reveal>
      )}

      {exploreLagos.show && (
        <Reveal>
          <HomeRailView heading="Explore Lagos intentionally" items={exploreLagos.items} isLoading={exploreLagos.isLoading} />
        </Reveal>
      )}

      {cultureAndHistory.show && (
        <Reveal>
          <HomeRailView
            mutedHeading="Culture & history"
            heading="experiences"
            items={cultureAndHistory.items}
            isLoading={cultureAndHistory.isLoading}
            seeMoreHref="/categories/culture-history"
          />
        </Reveal>
      )}

      <Reveal>
        <HomeTasteQuizBandView {...tasteQuiz} />
      </Reveal>

      {localFoodAndDrinks.show && (
        <Reveal>
          <HomeRailView
            mutedHeading="Local food & drinks"
            heading="experiences"
            items={localFoodAndDrinks.items}
            isLoading={localFoodAndDrinks.isLoading}
            seeMoreHref="/categories/local-food-drinks"
          />
        </Reveal>
      )}

      {cities.show && (
        <Reveal>
          <HomeCitiesView cities={cities.cities} />
        </Reveal>
      )}

      <Reveal>
        <HomeBrowseView />
      </Reveal>

      {unforgettableTravel.show && (
        <Reveal>
          <HomeRailView
            heading="Unforgettable travel experiences"
            items={unforgettableTravel.items}
            isLoading={unforgettableTravel.isLoading}
          />
        </Reveal>
      )}

      {browsingHistory.show && (
        <Reveal>
          <HomeRailView
            heading="Based on your browsing history"
            items={browsingHistory.items}
            isLoading={browsingHistory.isLoading}
          />
        </Reveal>
      )}

      <Reveal>
        <NewsletterSection />
      </Reveal>
      <Reveal>
        <Footer tone="white" />
      </Reveal>
    </div>
  );
}
