import { Reveal } from "@/components/motion/reveal";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Footer } from "@/features/footer";

import { HOME_SECTION_IDS } from "../model/home-sections.types";
import type { HomeViewModel } from "../view-model/use-home-view-model";
import { HomeBrowseView } from "./home-browse-view";
import { HomeCitiesView } from "./home-cities-view";
import { HomeHeroView } from "./home-hero-view";
import { HomeRailView } from "./home-rail-view";
import { HomeTasteQuizPopupView } from "./home-taste-quiz-popup-view";
import { HomeWhyBookView } from "./home-why-book-view";

// Figma "Home" (2656:72985). Section order follows the design; rails with
// nothing to show are left out. "Discover by categories" lives on the
// experiences and events pages, not here.
export function HomeView({
  hero,
  pickUp,
  basedOnSearch,
  tonightAndThisWeekend,
  pickedForYou,
  localFoodAndDrinks,
  earlyBird,
  newOnMyJourny,
  unforgettableTravel,
  tasteQuizPopup,
  cities,
}: HomeViewModel) {
  return (
    <div className="flex w-full max-w-full flex-1 flex-col overflow-x-clip">
      <HomeHeroView {...hero} />

      <Reveal>
        <HomeWhyBookView />
      </Reveal>

      {pickUp.show && (
        <Reveal>
          <HomeRailView heading="Pick up where you left off" items={pickUp.items} isLoading={pickUp.isLoading} />
        </Reveal>
      )}

      {basedOnSearch.show && (
        <Reveal>
          <HomeRailView
            heading={`Based on your search in ${basedOnSearch.area}`}
            items={basedOnSearch.items}
            isLoading={basedOnSearch.isLoading}
          />
        </Reveal>
      )}

      {tonightAndThisWeekend.show && (
        <Reveal>
          <HomeRailView
            heading="Tonight and this weekend"
            items={tonightAndThisWeekend.items}
            isLoading={tonightAndThisWeekend.isLoading}
            seeMoreHref="/events"
          />
        </Reveal>
      )}

      {pickedForYou.show && (
        <Reveal>
          <HomeRailView
            heading="Picked for your taste"
            items={pickedForYou.items}
            isLoading={pickedForYou.isLoading}
            seeMoreHref="/popular-experiences"
          />
        </Reveal>
      )}

      {localFoodAndDrinks.show && (
        <Reveal>
          <HomeRailView
            heading="Dive deeper into Local food & drinks"
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

      {earlyBird.show && (
        <Reveal>
          <HomeRailView heading="Early bird ending soon" items={earlyBird.items} isLoading={earlyBird.isLoading} />
        </Reveal>
      )}

      {newOnMyJourny.show && (
        <Reveal>
          <HomeRailView heading="New on MyJourny" items={newOnMyJourny.items} isLoading={newOnMyJourny.isLoading} />
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

      <div id={HOME_SECTION_IDS.newsletter}>
        <Reveal>
          <NewsletterSection />
        </Reveal>
      </div>
      <Reveal>
        <Footer />
      </Reveal>

      <HomeTasteQuizPopupView {...tasteQuizPopup} />
    </div>
  );
}
