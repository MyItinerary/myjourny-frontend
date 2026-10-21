"use client";

import { CategoryContent } from "./content";
import { useSession } from "@/lib/auth/session-store";
import { experienceListItemToCardProps, useInfiniteFilteredExperiences } from "@/lib/queries/experiences";
import { findCategoryBySlug, useInterestCategories } from "@/lib/queries/categories";

// One grid page: 4 rows of the 4-col layout.
const PAGE_SIZE = 16;

// The public listing filtered by this interest category or subcategory
// (/experiences/filter?interest=<slug>), the same for guests and signed-in
// users. The title comes from GET /categories (with subcategories).
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const { hydrated } = useSession();

  const categoriesQuery = useInterestCategories({ tree: true });
  const matchedCategory = categoriesQuery.data ? findCategoryBySlug(categoriesQuery.data, slug) : undefined;
  const resolvedLabel = matchedCategory ? matchedCategory.text : label;

  const query = useInfiniteFilteredExperiences({ interest: slug, pageSize: PAGE_SIZE, enabled: hydrated });

  return (
    <CategoryContent
      label={resolvedLabel}
      items={(query.data?.pages ?? []).flatMap((p) => p.items).map(experienceListItemToCardProps)}
      total={query.data?.pages[0]?.total}
      isLoading={!hydrated || query.isPending}
      isError={query.isError}
      onRetry={() => query.refetch()}
      loadMore={{
        hasMore: query.hasNextPage,
        isLoading: query.isFetchingNextPage,
        isError: query.isFetchNextPageError,
        onLoadMore: () => query.fetchNextPage(),
      }}
    />
  );
}
