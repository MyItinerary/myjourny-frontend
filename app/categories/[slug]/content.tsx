"use client";

import type { ComponentProps, ReactNode } from "react";

import { HomeNav } from "@/components/home/home-nav";
import { CitiesSection } from "@/components/home/cities-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { CategoryHeader, CategoryResultsGrid } from "@/features/categories";
import { useDiscoverCitiesViewModel } from "@/features/cities";
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
  /** Filter controls shown under the heading. */
  filters?: ReactNode;
}) {
  const discoverCities = useDiscoverCitiesViewModel();
  return (
    <div className="flex flex-1 flex-col">
      <HomeNav />

      <div className="px-6 pt-4 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-10 xl:px-[150px] lg:pt-9 lg:pb-9">
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

      {discoverCities.show && <CitiesSection cities={discoverCities.cities} variant="category" />}

      <OtherExperiencesRail exclude={items} />

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
      subheading="There's always something to do around you"
      items={items}
      isLoading={isPending}
      cardVariant="vertical"
      wide
    />
  );
}
