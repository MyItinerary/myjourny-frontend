"use client";

import { useSearchParams } from "next/navigation";

import { CategoryContent } from "./content";
import { useSearchResultsViewModel } from "@/features/search-results";
import { findCategoryBySlug, useInterestCategories } from "@/lib/queries/categories";

// Resolves the category title from GET /categories (with subcategories) and
// lists it from the public listing (/experiences/filter?interest=<slug>), the
// same for guests and accounts so the filter row can narrow it.
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const categoriesQuery = useInterestCategories({ tree: true });
  const matchedCategory = categoriesQuery.data ? findCategoryBySlug(categoriesQuery.data, slug) : undefined;
  const resolvedLabel = matchedCategory ? matchedCategory.text : label;

  // Dates picked in the search bar start the page's date filter.
  const searchParams = useSearchParams();
  const results = useSearchResultsViewModel({
    subject: { kind: "category", label: resolvedLabel },
    interest: slug,
    date: searchParams.get("date") ?? undefined,
    until: searchParams.get("until") ?? undefined,
  });

  return <CategoryContent label={resolvedLabel} items={results.items} results={results} />;
}
