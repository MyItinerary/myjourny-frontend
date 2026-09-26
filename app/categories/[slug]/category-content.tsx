"use client";

import { CategoryContent } from "./content";
import { useSession } from "@/lib/auth/session-store";
import { getCategoryListing } from "@/lib/mock-data/home";
import { experienceMatchToCardProps, useRecommendedExperiences } from "@/lib/queries/experiences";
import { useInterestCategories } from "@/lib/queries/categories";

// Live data for signed-in users (itin's experience endpoints are auth-only).
// Resolves category id and title from GET /categories, then fetches
// GET /experiences/recommendations?id=<categoryId>.
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const { user } = useSession();
  const isAccount = user !== null;

  const categoriesQuery = useInterestCategories();
  const matchedCategory = categoriesQuery.data?.find(
    (c) => c.slug === slug || String(c.id) === slug
  );
  const categoryId =
    matchedCategory?.id ?? (Number.isInteger(Number(slug)) ? Number(slug) : undefined);
  const resolvedLabel = matchedCategory ? matchedCategory.text : label;

  const query = useRecommendedExperiences({
    id: categoryId,
    enabled: isAccount && categoryId !== undefined,
  });

  const items = isAccount
    ? (query.data ?? []).map(experienceMatchToCardProps)
    : (getCategoryListing(slug) ?? []);

  return (
    <CategoryContent
      label={resolvedLabel}
      items={items}
      isLoading={isAccount && (categoriesQuery.isLoading || query.isFetching)}
    />
  );
}
