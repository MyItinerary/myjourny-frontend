"use client";

import { CategoryContent } from "./content";
import { useSession } from "@/lib/auth/session-store";
import { getCategoryListing } from "@/lib/mock-data/home";
import { experienceMatchToCardProps, useRecommendedExperiences } from "@/lib/queries/experiences";

// Real data for signed-in users (itin's experience endpoints are all
// auth-only); guests keep the exact static mock listing they've always
// gotten — CategoriesSection chips already link here for guests today, so
// removing that would be a regression, not just avoiding a new bug.
export function CategoryPageContent({ slug, label }: { slug: string; label: string }) {
  const { user } = useSession();
  const isAccount = user !== null;

  const query = useRecommendedExperiences({ interest: slug, enabled: isAccount });
  const items = isAccount
    ? (query.data ?? []).map(experienceMatchToCardProps)
    : (getCategoryListing(slug) ?? []);

  return <CategoryContent label={label} items={items} isLoading={isAccount && query.isFetching} />;
}
