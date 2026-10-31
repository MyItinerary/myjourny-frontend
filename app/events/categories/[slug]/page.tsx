import type { Metadata } from "next";

import { eventCategoryLabel } from "@/features/event-categories";

import { EventCategoryContent } from "./content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${eventCategoryLabel(decodeURIComponent(slug))} events | MyJourny` };
}

export default async function EventCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventCategoryContent slug={slug} />;
}
