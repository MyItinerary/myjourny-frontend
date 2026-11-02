"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { HomeNav } from "@/components/home/home-nav";
import { Footer } from "@/components/home/footer";
import { CategoryResultsGrid } from "@/features/categories";
import {
  EmptyResultsView,
  MoreFiltersDialogView,
  ResultsFilterRowView,
  useSearchResultsViewModel,
} from "@/features/search-results";

// The search results page: the filter row and 4-col grid of the city page
// (Figma "Home" 2001:18074), listing from the public /experiences/filter
// endpoint with the typed text as `search`, so every filter applies.
export function SearchContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const results = useSearchResultsViewModel({
    subject: query ? { kind: "query", label: query } : { kind: "category", label: "All experiences" },
    search: query || undefined,
    date: searchParams.get("date") ?? undefined,
    until: searchParams.get("until") ?? undefined,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HomeNav searchSummary={{ where: results.heading, query }} />

      <main className="flex-1 bg-white">
        <div className="flex flex-col gap-4 px-6 pt-4 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:gap-[18px] lg:px-20 lg:pt-9">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
            <Link href="/" className="text-base font-medium text-brand">
              Home page
            </Link>
            <span aria-hidden className="text-base text-foreground">
              /
            </span>
            <span className="text-base font-medium text-foreground">Search</span>
          </nav>

          <h1 className="font-heading text-[32px] leading-[1.2] font-extrabold text-[#333134] lg:text-[32px]">
            {results.heading} <span className="text-[#6f6b72]">{results.countLabel}</span>
          </h1>
        </div>

        {/* The row sticks under the nav for as long as this section is on screen. */}
        <section>
          <ResultsFilterRowView {...results} className="mt-4 lg:mt-[18px]" />

          <div className="px-6 pt-5 pb-10 lg:mx-auto lg:w-full lg:max-w-[1512px] lg:px-20 lg:pt-7 lg:pb-12">
          {results.isEmpty ? (
            <EmptyResultsView hasActiveFilters={results.hasActiveFilters} onClearAll={results.clearAll} />
          ) : (
            <CategoryResultsGrid
              items={results.items}
              categoryLabel={query || "this search"}
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
      </main>

      <MoreFiltersDialogView {...results} />

      <Footer />
    </div>
  );
}
