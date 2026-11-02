"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { HomeNav } from "@/components/home/home-nav";
import { CitiesSection } from "@/components/home/cities-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { CategoryHeader, CategoryResultsGrid } from "@/features/categories";
import { useDiscoverCitiesViewModel } from "@/features/cities";
import {
  EmptyResultsView,
  MoreFiltersDialogView,
  ResultsFilterRowView,
  type SearchResultsViewModel,
} from "@/features/search-results";
import { experienceListItemToCardProps, useFilteredExperiences } from "@/lib/queries/experiences";
import type { ExperienceItem } from "@/lib/mock-data/home";

// Figma: "Home" (2001:11985 desktop / "Home page" 2001:12375 mobile) — a
// single-category results listing. Reuses the standard desktop `HomeNav`;
// mobile gets a page-specific back+search header instead (2001:12377),
// inlined here since no other page uses this compact search bar yet.
export function CategoryContent({
  label,
  items,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  moreLabel,
  loadMore,
  total,
  results,
  filters,
}: {
  label: string;
  items: ExperienceItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  moreLabel?: string;
  loadMore?: ComponentProps<typeof CategoryResultsGrid>["loadMore"];
  /** Exact result count, when the source knows it. */
  total?: number;
  /** Filterable results (the new layout: filter row, 80px margins). Without it the page keeps its plain header. */
  results?: SearchResultsViewModel;
  /** Filter controls shown under the heading, on the plain header. */
  filters?: ReactNode;
}) {
  const discoverCities = useDiscoverCitiesViewModel();
  return (
    <div className="flex flex-1 flex-col">
      <HomeNav searchSummary={results ? { where: results.heading, query: label } : undefined} />

      {results ? (
        <>
          <div className="px-6 pt-4 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-9">
            <div className="flex flex-col gap-4 lg:gap-[18px]">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
                <Link href="/" className="text-base font-medium text-brand">
                  Home page
                </Link>
                <span aria-hidden className="text-base text-foreground">
                  /
                </span>
                <span className="text-base font-medium text-foreground">{label}</span>
              </nav>
              <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-[#333134] lg:text-[32px]">
                {results.heading} <span className="text-[#6f6b72]">{results.countLabel}</span>
              </h1>
            </div>
          </div>

          {/* The row sticks under the nav for as long as this section is on screen. */}
          <section>
            <ResultsFilterRowView {...results} className="mt-4 lg:mt-[18px]" />

            <div className="px-6 pt-5 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-7 lg:pb-9">
              {results.isEmpty ? (
                <EmptyResultsView
                  hasActiveFilters={results.hasActiveFilters}
                  onClearAll={results.clearAll}
                />
              ) : (
                <CategoryResultsGrid
                  items={results.items}
                  categoryLabel={label}
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
        </>
      ) : (
        <div className="px-6 pt-4 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-9 lg:pb-9">
          <CategoryHeader
            label={label}
            count={items.length}
            total={total}
            isLoading={isLoading}
            isError={isError}
            filters={filters}
          />
          <div className="mt-6 lg:mt-9">
            <CategoryResultsGrid
              items={items}
              categoryLabel={label}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              onRetry={onRetry}
              moreLabel={moreLabel}
              loadMore={loadMore}
            />
          </div>
        </div>
      )}

      {discoverCities.show && <CitiesSection cities={discoverCities.cities} />}

      <OtherExperiencesRail exclude={results ? results.items : items} />

      <Footer />
    </div>
  );
}

// Best-rated experiences from the public listing (works for guests too),
// minus anything already in the grid above.
function OtherExperiencesRail({ exclude }: { exclude: ExperienceItem[] }) {
  const { data, isPending } = useFilteredExperiences({ sort: "rating_desc", limit: 20 });
  const shown = new Set(exclude.map((item) => item.id));
  const items = (data?.items ?? [])
    .map(experienceListItemToCardProps)
    .filter((item) => !shown.has(item.id))
    .slice(0, 10);

  if (!isPending && items.length === 0) return null;
  return (
    <ExperienceRailSection
      heading="Other experiences you might find interesting"
      items={items}
      isLoading={isPending}
      cardVariant="vertical"
    />
  );
}
