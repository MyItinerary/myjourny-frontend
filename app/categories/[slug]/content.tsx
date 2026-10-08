"use client";

import type { ComponentProps } from "react";
import Image from "next/image";
import Link from "next/link";

import { HomeNav } from "@/components/home/home-nav";
import { CitiesSection } from "@/components/home/cities-section";
import { ExperienceRailSection } from "@/components/home/experience-rail-section";
import { Footer } from "@/components/home/footer";
import { CategoryHeader } from "@/components/categories/category-header";
import { CategoryResultsGrid } from "@/components/categories/category-results-grid";
import { ChevronLeftIcon } from "@/components/icons/onboarding-icons";
import { cities } from "@/lib/mock-data/home";
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
  moreLabel,
  loadMore,
  total,
}: {
  label: string;
  items: ExperienceItem[];
  isLoading?: boolean;
  moreLabel?: string;
  loadMore?: ComponentProps<typeof CategoryResultsGrid>["loadMore"];
  /** Exact result count, when the source knows it. */
  total?: number;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="hidden lg:block">
        <HomeNav />
      </div>

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

      <div className="px-6 pt-4 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-[150px] lg:pt-9 lg:pb-9">
        <CategoryHeader label={label} count={items.length} total={total} />
        <div className="mt-6 lg:mt-9">
          <CategoryResultsGrid items={items} categoryLabel={label} isLoading={isLoading} moreLabel={moreLabel} loadMore={loadMore} />
        </div>
      </div>

      <CitiesSection cities={cities} variant="category" />

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
