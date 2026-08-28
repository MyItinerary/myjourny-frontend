import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { cities } from "@/lib/mock-data/home";
import { CityContent } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = cities.find((c) => c.id === slug);
  return { title: city ? `${city.name} — MyJourny` : "MyJourny" };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = cities.find((c) => c.id === slug);
  if (!city) notFound();

  return <CityContent cityName={city.name} />;
}
