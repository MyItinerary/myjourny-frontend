"use client";

import { CategoryContent } from "./content";
import { useSearchResultsViewModel } from "@/features/search-results";
import { findCategoryBySlug, useInterestCategories } from "@/lib/queries/categories";

// Resolves the category title from GET /categories and lists it from the
// public listing (/experiences/filter?interest=<slug>), the same for guests
// and accounts so the filter row can narrow it.
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const categoriesQuery = useInterestCategories();
  const matchedCategory = categoriesQuery.data
    ? findCategoryBySlug(categoriesQuery.data, slug)
    : undefined;
  const resolvedLabel = matchedCategory ? matchedCategory.text : label;

  const results = useSearchResultsViewModel({
    subject: { kind: "category", label: resolvedLabel },
    interest: slug,
  });

  return <CategoryContent label={resolvedLabel} items={results.items} results={results} />;
}
