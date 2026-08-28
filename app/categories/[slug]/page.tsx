import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { categoriesBySlug } from "@/lib/mock-data/home";
import { CategoryPageContent } from "./category-content";

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
  if (!category) notFound();

  return <CategoryPageContent slug={slug} label={category.label} />;
}
