import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eventCategoryLabel } from "@/features/event-categories";
import { eventsEnabled } from "@/features/event-details";

import { EventCategoryContent } from "./content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${eventCategoryLabel(decodeURIComponent(slug))} events | MyJourny` };
}

export default async function EventCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Events are not live until they can be set up on the admin dashboard.
  if (!eventsEnabled()) notFound();
  const { slug } = await params;
  return <EventCategoryContent slug={slug} />;
}
