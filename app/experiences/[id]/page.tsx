import type { Metadata } from "next";

import { ExperienceDetailContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  // The real title needs an authenticated API call (client-fetched in
  // content.tsx) — no server-side data source available here.
  return { title: "Experience — MyJourny" };
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExperienceDetailContent id={id} />;
}
