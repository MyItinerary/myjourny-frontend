import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { eventsEnabled } from "@/lib/feature-flags";

import { EventsContent } from "./content";

export const metadata: Metadata = {
  title: "Events you won’t miss for anything | MyJourny",
  description: "Concerts, conferences, meetups, and nights out across Nigeria.",
};

export default function EventsPage() {
  // Events are not live until they can be set up on the admin dashboard.
  if (!eventsEnabled()) notFound();
  return <EventsContent />;
}
