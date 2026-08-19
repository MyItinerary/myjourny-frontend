import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { categoriesBySlug, getCategoryListing } from "@/lib/mock-data/home";
import { CategoryContent } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoriesBySlug.get(slug);
  return { title: category ? `${category.label} — MyJourny` : "MyJourny" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoriesBySlug.get(slug);
  const items = getCategoryListing(slug);
  if (!category || !items) notFound();

  return <CategoryContent label={category.label} items={items} />;
}
