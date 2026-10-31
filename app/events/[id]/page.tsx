import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eventsEnabled } from "@/lib/feature-flags";

import { EventDetailContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  // The event's title comes from the events API, fetched in content.tsx.
  return { title: "Event | MyJourny" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Events are not live until they can be set up on the admin dashboard.
  if (!eventsEnabled()) notFound();
  const { id } = await params;
  return <EventDetailContent id={id} />;
}
