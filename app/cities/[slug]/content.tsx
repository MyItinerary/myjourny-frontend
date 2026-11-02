"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { HomeNav } from "@/components/home/home-nav";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { CategoryResultsGrid } from "@/features/categories";
import {
  EmptyResultsView,
  MoreFiltersDialogView,
  ResultsFilterRowView,
  useSearchResultsViewModel,
} from "@/features/search-results";
import { useSession } from "@/lib/auth/session-store";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  useFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";

// Figma: "Home" (2001:18074) — city results opened from a search or a
// "Discover by cities" tile: breadcrumb, "Things to do in <city>" heading,
// the filter row (More filters, dropdown chips, categories), a 4-col grid
// with "Show more", then "Discover beyond <city>". The nav shows the search
// as a pill. Side margins are 80px (the old 150px page margin is gone).
// The grid is the public per-city listing (/experiences/filter?city=), the
// same for guests and accounts. "Discover beyond" is personalised for
// accounts and best-rated for guests.
export function CityContent({ cityName, country }: { cityName: string; country?: string }) {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;
  const isGuest = hydrated && !isAccount;

  // Dates picked in the search bar start the page's date filter.
  const searchParams = useSearchParams();
  const results = useSearchResultsViewModel({
    subject: { kind: "city", label: cityName },
    city: cityName,
    date: searchParams.get("date") ?? undefined,
    until: searchParams.get("until") ?? undefined,
  });

  // Neither source can exclude a city, so over-fetch and drop this city's
  // own experiences to still fill the rail.
  const accountBeyondQuery = useRecommendedExperiences({ offset: 0, limit: 20, enabled: isAccount });
  const guestBeyondQuery = useFilteredExperiences({ sort: "rating_desc", limit: 20, enabled: isGuest });

  const isThisCity = (city?: string | null) => city?.toLowerCase() === cityName.toLowerCase();
  const beyondItems = isAccount
    ? (accountBeyondQuery.data ?? []).filter((m) => !isThisCity(m.city)).slice(0, 10).map(experienceMatchToCardProps)
    : (guestBeyondQuery.data?.items ?? []).filter((m) => !isThisCity(m.city)).slice(0, 10).map(experienceListItemToCardProps);
  const beyondIsLoading = isAccount ? accountBeyondQuery.isPending : !hydrated || guestBeyondQuery.isPending;


  return (
    <div className="flex flex-1 flex-col">
      <HomeNav searchSummary={{ where: results.heading, query: cityName }} />

      <div className="px-6 pt-4 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-9">
        <div className="flex flex-col gap-4 lg:gap-[18px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
            <Link href="/" className="text-base font-medium text-brand">
              Home page
            </Link>
            <span aria-hidden className="text-base text-foreground">
              /
            </span>
            <span className="text-base font-medium text-foreground">
              {country ? `${cityName} ${country}` : cityName}
            </span>
          </nav>

          <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-[#333134] lg:text-[32px]">
            {results.heading} <span className="text-[#6f6b72]">{results.countLabel}</span>
          </h1>
        </div>
      </div>

      {/* The row sticks under the nav for as long as this section is on screen. */}
      <section>
        <ResultsFilterRowView {...results} className="mt-4 lg:mt-[18px]" />

        <div className="px-6 pt-5 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-7 lg:pb-12">
          {results.isEmpty ? (
            <EmptyResultsView
              hasActiveFilters={results.hasActiveFilters}
              onClearAll={results.clearAll}
            />
          ) : (
            <CategoryResultsGrid
              items={results.items}
              categoryLabel={cityName}
              isLoading={results.isLoading}
              isError={results.isError}
              errorMessage={results.errorMessage}
              onRetry={results.onRetry}
              moreLabel="Show more"
              loadMore={{
                hasMore: results.hasMore,
                isLoading: results.isLoadingMore,
                isError: results.isLoadMoreError,
                onLoadMore: results.onLoadMore,
              }}
            />
          )}
        </div>
      </section>

      <MoreFiltersDialogView {...results} />

      <ExperienceRailSection
        heading={`Discover beyond ${cityName}`}
        items={beyondItems}
        isLoading={beyondIsLoading}
        cardVariant="vertical"
        mobileArrowsBelow
      />

      <Footer />
    </div>
  );
}
