"use client";

import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { HomeNav } from "@/components/home/home-nav";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { CategoryResultsGrid } from "@/components/categories/category-results-grid";
import { FilterChip } from "@/components/categories/filter-chip";
import { ChevronLeftIcon } from "@/components/icons/onboarding-icons";
import { useSession } from "@/lib/auth/session-store";
import { otherExperiences, popularExperiences } from "@/lib/mock-data/home";
import { useInterestCategories } from "@/lib/queries/categories";
import {
  experienceMatchToCardProps,
  useInfiniteRecommendedExperiences,
  uniqueMatches,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";

const FILTERS = ["Dates", "Time of day", "Duration", "Price", "Languages"];
const FALLBACK_CATEGORY_CHIPS = ["Street food & markets", "Cafés & coffee culture", "Bars & nightlife drinks"];
// One grid page: 4 rows of the 4-col layout.
const PAGE_SIZE = 16;

// Figma: "Home" (2364:35709) — city listing opened from a "Discover by
// cities" tile: breadcrumb, "Experiences in <city>" heading, filter + category
// chips, 4-col results grid with "Show more", then "Discover beyond <city>".
// Signed-in users get live data (itin's experience endpoints are auth-only);
// guests see the mock lists.
export function CityContent({ cityName, country }: { cityName: string; country?: string }) {
  const { user } = useSession();
  const isAccount = user !== null;

  const cityQuery = useInfiniteRecommendedExperiences({ city: cityName, pageSize: PAGE_SIZE, enabled: isAccount });
  // Recommendations aren't city-filtered here, so over-fetch and drop this
  // city's own experiences to still fill the rail.
  const beyondQuery = useRecommendedExperiences({ offset: 0, limit: 20, enabled: isAccount });
  const categoriesQuery = useInterestCategories();

  const items = isAccount ? uniqueMatches(cityQuery.data?.pages).map(experienceMatchToCardProps) : popularExperiences;
  const beyondItems = isAccount
    ? (beyondQuery.data ?? [])
        .filter((m) => m.city?.toLowerCase() !== cityName.toLowerCase())
        .slice(0, 10)
        .map(experienceMatchToCardProps)
    : otherExperiences;

  const liveChips = (categoriesQuery.data ?? []).filter((c) => c.parent_id === null).map((c) => c.text);
  const categoryChips = liveChips.length > 0 ? liveChips : FALLBACK_CATEGORY_CHIPS;

  const countLabel = items.length === 0 ? "(0 results)" : `(${items.length}+ results)`;

  return (
    <div className="flex flex-1 flex-col">
      <HomeNav />

      <div className="flex items-center gap-3 px-6 py-4 lg:hidden">
        <Link
          href="/"
          aria-label="Back"
          className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ChevronLeftIcon className="size-[22px] text-foreground" />
        </Link>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-[#c7c1ba] bg-white px-4 py-3.5">
          <Image src="/icons/search-lg.svg" alt="" width={18} height={18} />
          <span className="text-sm text-muted-foreground">Discover locations</span>
        </div>
      </div>

      <div className="px-6 pt-4 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-[150px] lg:pt-9 lg:pb-12">
        <div className="flex flex-col gap-4 lg:gap-[18px]">
          <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 lg:flex">
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

          <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-foreground lg:text-[40px]">
            Experiences in {cityName} <span className="text-muted-foreground">{countLabel}</span>
          </h1>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[104px] bg-[#F4F2EE] px-4 py-1 text-sm text-foreground transition-colors hover:bg-[#eae7e1]"
            >
              <span>Filters</span>
              <SlidersHorizontal className="size-3.5" />
            </button>
            {FILTERS.map((filter) => (
              <FilterChip key={filter} label={filter} />
            ))}
            {categoryChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="shrink-0 cursor-pointer whitespace-nowrap rounded-[104px] bg-[#F4F2EE] px-4 py-1 text-sm text-foreground transition-colors hover:bg-[#eae7e1]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 lg:mt-9">
          <CategoryResultsGrid
            items={items}
            categoryLabel={cityName}
            isLoading={isAccount && cityQuery.isPending}
            moreLabel="Show more"
            // Guests get the mock list, which the grid pages through locally.
            loadMore={
              isAccount
                ? {
                    hasMore: cityQuery.hasNextPage,
                    isLoading: cityQuery.isFetchingNextPage,
                    onLoadMore: () => cityQuery.fetchNextPage(),
                  }
                : undefined
            }
          />
        </div>
      </div>

      <ExperienceRailSection
        heading={`Discover beyond ${cityName}`}
        subheading="There's always something to do anywhere else"
        items={beyondItems}
        isLoading={isAccount && beyondQuery.isPending}
        cardVariant="vertical"
        mobileArrowsBelow
        wide
      />

      <Footer />
    </div>
  );
}
