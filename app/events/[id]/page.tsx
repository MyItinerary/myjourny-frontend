import type { Metadata } from "next";

import { EventDetailContent } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  // The event's title comes from the events API, fetched in content.tsx.
  return { title: "Event | MyJourny" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailContent id={id} />;
}
