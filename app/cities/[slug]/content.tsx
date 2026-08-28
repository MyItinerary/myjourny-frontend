"use client";

import { CategoryContent } from "@/app/categories/[slug]/content";
import { experienceMatchToCardProps, useRecommendedExperiences } from "@/lib/queries/experiences";

// Reuses the category listing page's shell (CategoryContent) rather than
// duplicating it — it only ever needed `label` + `items`, which is exactly
// what a city listing needs too.
export function CityContent({ cityName }: { cityName: string }) {
  const { data } = useRecommendedExperiences({ city: cityName });
  const items = (data ?? []).map(experienceMatchToCardProps);

  return <CategoryContent label={cityName} items={items} />;
}
