import { NewsletterSection } from "@/components/home/newsletter-section";
import { Reveal } from "@/components/motion/reveal";
import { Footer } from "@/features/footer";
import { HomeCitiesView, HomeRailView } from "@/features/home";

import type { ExperiencesPageViewModel } from "../view-model/use-experiences-page-view-model";
import { CategoryPillsView } from "./category-pills-view";
import { DiscoveryHeroView } from "./discovery-hero-view";

// Figma "Experiences" (2656:72986). Rails with nothing to show are left out.
export function ExperiencesPageView({
  hero,
  pickUp,
  basedOnSearch,
  availableThisWeekend,
  pickedForYou,
  nearYouInLagos,
  categories,
  cities,
}: ExperiencesPageViewModel) {
  return (
    <div className="flex w-full max-w-full flex-1 flex-col overflow-x-clip">
      <DiscoveryHeroView
        hero={hero}
        title="Experiences worth showing up for"
        subtitle="Tours, tastings, workshops, and hidden spots, hosted by locals."
        titleWidth={644}
      />

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

      {availableThisWeekend.show && (
        <Reveal>
          <HomeRailView
            heading="Available this weekend"
            items={availableThisWeekend.items}
            isLoading={availableThisWeekend.isLoading}
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

      {nearYouInLagos.show && (
        <Reveal>
          <HomeRailView heading="Near you in Lagos" items={nearYouInLagos.items} isLoading={nearYouInLagos.isLoading} />
        </Reveal>
      )}

      <Reveal>
        <CategoryPillsView categories={categories} hrefBase="/categories" />
      </Reveal>

      {cities.show && (
        <Reveal>
          <HomeCitiesView cities={cities.cities} heading="Discover experiences by cities" />
        </Reveal>
      )}

      <Reveal>
        <NewsletterSection />
      </Reveal>
      <Reveal>
        <Footer />
      </Reveal>
    </div>
  );
}
