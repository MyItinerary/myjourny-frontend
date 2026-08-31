"use client";

import { useSession } from "@/lib/auth/session-store";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import {
  experienceMatchToCardProps,
  useBrowsingHistory,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { Reveal } from "@/components/motion/reveal";
import { HeroSection } from "@/components/home/hero-section";
import { WhyBookWithUsSection } from "@/components/home/why-book-with-us-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { CitiesSection } from "@/components/home/cities-section";
import { CtaSection } from "@/components/home/cta-section";
import { Footer } from "@/components/home/footer";
import {
  accountCategories,
  browsingHistoryExperiences,
  cities,
  guestCategories,
  popularExperiences,
  topPicks,
} from "@/lib/mock-data/home";

// Figma "Home" (2001:9142 guest / 2001:9152 account, mobile 2001:9168 /
// 2001:9462) — both states share the same 9 sections. Guests see
// Why-book-with-us before the personalized rails (nothing personalized to
// show yet, and guests stay on mock data — see DESIGN-SYSTEM.md/the
// homepage-integration plan for why: itin has no unauthenticated
// recommendations/categories endpoints). Signed-in accounts see
// Popular-experiences promoted right after Hero instead, backed by real
// itin data. See DESIGN-SYSTEM.md for the full node id map.
export function HomeContent() {
  const { user } = useSession();
  const isAccount = user !== null;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";

  // "Popular near you" waits for geolocation to settle (either resolves
  // with coordinates, or "unavailable" — never fires against a still-
  // pending result). Once settled without coordinates, it falls to the
  // same location-agnostic call "Top picks" always uses.
  const popularQuery = useRecommendedExperiences({
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
    offset: 0,
    limit: 6, // matches the Figma-verified mock it replaces (6 desktop / 3 mobile, sliced in ExperienceRailSection)
    enabled: isAccount && geolocation !== "pending",
  });
  const topPicksQuery = useRecommendedExperiences({
    offset: 6,
    limit: 10,
    enabled: isAccount,
  });
  const browsingHistoryQuery = useBrowsingHistory(10);

  const popularIsLoading = isAccount && (geolocation === "pending" || popularQuery.isFetching);
  const topPicksIsLoading = isAccount && topPicksQuery.isFetching;
  const browsingHistoryIsLoading = isAccount && browsingHistoryQuery.isFetching;

  const realPopularItems = (popularQuery.data ?? []).map(experienceMatchToCardProps);
  const realTopPicksItems = (topPicksQuery.data ?? []).map(experienceMatchToCardProps);
  const realBrowsingHistoryItems = (browsingHistoryQuery.data ?? []).map(
    experienceMatchToCardProps
  );

  const popularSection = isAccount ? (
    !popularIsLoading && realPopularItems.length === 0 ? null : (
      <Reveal key="popular-experiences">
        <ExperienceRailSection
          heading="Popular experiences near you"
          subheading="Hand-picked spots people are loving right now."
          items={realPopularItems}
          isLoading={popularIsLoading}
        />
      </Reveal>
    )
  ) : (
    <Reveal key="popular-experiences">
      <ExperienceRailSection
        heading="Popular experiences near you"
        subheading="Hand-picked spots people are loving right now."
        items={popularExperiences}
      />
    </Reveal>
  );

  const whyBookWithUsSection = (
    <Reveal key="why-book-with-us">
      <WhyBookWithUsSection />
    </Reveal>
  );

  return (
    <div className="flex flex-1 flex-col">
      <HeroSection />

      {/* Order differs by session state — see the note above the component. */}
      {isAccount ? (
        <>
          {popularSection}
          {whyBookWithUsSection}
        </>
      ) : (
        <>
          {whyBookWithUsSection}
          {popularSection}
        </>
      )}

      <Reveal>
        <CategoriesSection categories={isAccount ? accountCategories : guestCategories} />
      </Reveal>

      {isAccount ? (
        !topPicksIsLoading && realTopPicksItems.length === 0 ? null : (
          <Reveal>
            <ExperienceRailSection
              heading="Top picks right now"
              subheading="What’s happening around you"
              items={realTopPicksItems}
              cardVariant="vertical"
              isLoading={topPicksIsLoading}
            />
          </Reveal>
        )
      ) : (
        <Reveal>
          <ExperienceRailSection
            heading="Top picks right now"
            subheading="What’s happening in Lagos"
            items={topPicks}
            cardVariant="vertical"
          />
        </Reveal>
      )}

      <Reveal>
        <CitiesSection cities={cities} isAccount={isAccount} />
      </Reveal>

      {isAccount ? (
        !browsingHistoryIsLoading && realBrowsingHistoryItems.length === 0 ? null : (
          <Reveal>
            <ExperienceRailSection
              heading="Based on your browsing history"
              subheading="A few things we noticed you're drawn to."
              items={realBrowsingHistoryItems}
              cardVariant="vertical"
              isLoading={browsingHistoryIsLoading}
            />
          </Reveal>
        )
      ) : (
        <Reveal>
          <ExperienceRailSection
            heading="Based on your browsing history"
            subheading="A few things we noticed you're drawn to."
            items={browsingHistoryExperiences}
            cardVariant="vertical"
          />
        </Reveal>
      )}

      <Reveal>
        <CtaSection />
      </Reveal>
      <Reveal>
        <Footer />
      </Reveal>
    </div>
  );
}
