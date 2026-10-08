"use client";

import { useSession } from "@/lib/auth/session-store";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  useBrowsingHistory,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { useInterestCategories } from "@/lib/queries/categories";
import { Reveal } from "@/components/motion/reveal";
import { HeroSection } from "@/components/home/hero-section";
import { WhyBookWithUsSection } from "@/components/home/why-book-with-us-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { CitiesSection } from "@/components/home/cities-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Footer } from "@/components/home/footer";
import { accountCategories, cities, guestCategories } from "@/lib/mock-data/home";

// Figma "Home" (2001:9142 guest / 2001:9152 account, mobile 2001:9168 /
// 2001:9462) — both states share the same 9 sections. Guests see
// Why-book-with-us before the rails, which come from the public
// /experiences/filter listing (recommendations need a profile, so there's
// no "near you" or browsing history for them). Signed-in accounts see
// personalised Popular-experiences right after Hero instead. See
// DESIGN-SYSTEM.md for the full node id map.
export function HomeContent() {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;
  // Wait for the stored session so signed-in users don't fire guest queries.
  const isGuest = hydrated && !isAccount;

  const geolocation = useGeolocation();
  const hasCoords = typeof geolocation === "object";

  // "Popular near you" and "Top picks right now" both wait for geolocation
  // to settle (either resolves with coordinates, or "unavailable" — never
  // fires against a still-pending result). When coordinates are available,
  // both queries pass them so experiences are filtered around the user's location.
  const popularQuery = useRecommendedExperiences({
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
    offset: 0,
    limit: 6, // matches the Figma-verified mock it replaces (6 desktop / 3 mobile, sliced in ExperienceRailSection)
    enabled: isAccount && geolocation !== "pending",
  });
  const topPicksQuery = useRecommendedExperiences({
    latitude: hasCoords ? geolocation.latitude : undefined,
    longitude: hasCoords ? geolocation.longitude : undefined,
    offset: 6,
    limit: 10,
    enabled: isAccount && geolocation !== "pending",
  });
  const browsingHistoryQuery = useBrowsingHistory(10);
  // Guests have no profile to personalise against, so their rails come from
  // the plain listing: best rated, and newest.
  const guestPopularQuery = useFilteredExperiences({ sort: "rating_desc", limit: 6, enabled: isGuest });
  const guestTopPicksQuery = useFilteredExperiences({ sort: "created_at_desc", limit: 10, enabled: isGuest });
  const guestPopularItems = (guestPopularQuery.data?.items ?? []).map(experienceListItemToCardProps);
  const guestTopPicksItems = (guestTopPicksQuery.data?.items ?? []).map(experienceListItemToCardProps);
  const categoriesQuery = useInterestCategories();

  const popularIsLoading = isAccount && (geolocation === "pending" || popularQuery.isFetching);
  const topPicksIsLoading = isAccount && (geolocation === "pending" || topPicksQuery.isFetching);
  const browsingHistoryIsLoading = isAccount && browsingHistoryQuery.isFetching;

  const realPopularItems = (popularQuery.data ?? []).map(experienceMatchToCardProps);
  const realTopPicksItems = (topPicksQuery.data ?? []).map(experienceMatchToCardProps);
  const realBrowsingHistoryItems = (browsingHistoryQuery.data ?? []).map(
    experienceMatchToCardProps
  );

  // Compute live categories from backend API when available
  const liveCategories = categoriesQuery.data && categoriesQuery.data.length > 0
    ? (() => {
        const active = categoriesQuery.data.filter((c) => c.is_active);
        const nestedChildren = active.flatMap((c) => c.children ?? []);
        const children = nestedChildren.length > 0 ? nestedChildren : active.filter((c) => c.parent_id !== null);
        const selected = isAccount && children.length > 0 ? children : active;
        return selected.map((c) => ({
          id: c.slug,
          label: c.text,
        }));
      })()
    : isAccount ? accountCategories : guestCategories;

  const popularSection = isAccount ? (
    !popularIsLoading && realPopularItems.length === 0 ? null : (
      <Reveal key="popular-experiences">
        <ExperienceRailSection
          heading="Popular experiences near you"
          subheading="Hand-picked spots people are loving right now."
          items={realPopularItems}
          isLoading={popularIsLoading}
          seeMoreHref="/popular-experiences"
        />
      </Reveal>
    )
  ) : !guestPopularQuery.isPending && guestPopularItems.length === 0 ? null : (
    <Reveal key="popular-experiences">
      <ExperienceRailSection
        heading="Popular experiences"
        subheading="Hand-picked spots people are loving right now."
        items={guestPopularItems}
        isLoading={guestPopularQuery.isPending}
        seeMoreHref="/popular-experiences"
      />
    </Reveal>
  );

  const whyBookWithUsSection = (
    <Reveal key="why-book-with-us">
      <WhyBookWithUsSection />
    </Reveal>
  );

  return (
    <div className="flex flex-1 flex-col w-full max-w-full overflow-x-clip">
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
        <CategoriesSection categories={liveCategories} />
      </Reveal>

      {isAccount ? (
        !topPicksIsLoading && realTopPicksItems.length === 0 ? null : (
          <Reveal>
            <ExperienceRailSection
              heading="Top picks right now"
              subheading={hasCoords ? "What's happening around you" : "What's happening right now"}
              items={realTopPicksItems}
              cardVariant="vertical"
              isLoading={topPicksIsLoading}
            />
          </Reveal>
        )
      ) : !guestTopPicksQuery.isPending && guestTopPicksItems.length === 0 ? null : (
        <Reveal>
          <ExperienceRailSection
            heading="Top picks right now"
            subheading="New on MyJourny"
            items={guestTopPicksItems}
            cardVariant="vertical"
            isLoading={guestTopPicksQuery.isPending}
          />
        </Reveal>
      )}

      <Reveal>
        <CitiesSection cities={cities} />
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
      ) : null}

      <Reveal>
        <NewsletterSection />
      </Reveal>
      <Reveal>
        <Footer tone="white" />
      </Reveal>
    </div>
  );
}
