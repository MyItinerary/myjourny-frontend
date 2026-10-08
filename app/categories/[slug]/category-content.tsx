"use client";

import { CategoryContent } from "./content";
import { useSession } from "@/lib/auth/session-store";
import {
  experienceListItemToCardProps,
  experienceMatchToCardProps,
  useInfiniteFilteredExperiences,
  useRecommendedExperiences,
} from "@/lib/queries/experiences";
import { findCategoryBySlug, useInterestCategories } from "@/lib/queries/categories";

// One grid page: 4 rows of the 4-col layout.
const PAGE_SIZE = 16;

// Resolves category id and title from GET /categories. Signed-in users get
// GET /experiences/recommendations?id=<categoryId>; guests get the public
// listing filtered by this interest (/experiences/filter?interest=<slug>).
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const { user, hydrated } = useSession();
  const isAccount = user !== null;
  const isGuest = hydrated && !isAccount;

  const categoriesQuery = useInterestCategories();
  const matchedCategory = categoriesQuery.data
    ? findCategoryBySlug(categoriesQuery.data, slug)
    : undefined;
  const categoryId =
    matchedCategory?.id ?? (Number.isInteger(Number(slug)) ? Number(slug) : undefined);
  const resolvedLabel = matchedCategory ? matchedCategory.text : label;

  const accountQuery = useRecommendedExperiences({
    id: categoryId,
    enabled: isAccount && categoryId !== undefined,
  });
  const guestQuery = useInfiniteFilteredExperiences({ interest: slug, pageSize: PAGE_SIZE, enabled: isGuest });

  if (isAccount) {
    return (
      <CategoryContent
        label={resolvedLabel}
        items={(accountQuery.data ?? []).map(experienceMatchToCardProps)}
        isLoading={categoriesQuery.isLoading || accountQuery.isFetching}
      />
    );
  }

  return (
    <CategoryContent
      label={resolvedLabel}
      items={(guestQuery.data?.pages ?? []).flatMap((p) => p.items).map(experienceListItemToCardProps)}
      total={guestQuery.data?.pages[0]?.total}
      isLoading={!hydrated || guestQuery.isPending}
      loadMore={{
        hasMore: guestQuery.hasNextPage,
        isLoading: guestQuery.isFetchingNextPage,
        onLoadMore: () => guestQuery.fetchNextPage(),
      }}
    />
  );
}
