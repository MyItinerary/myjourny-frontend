"use client";

import { EventDetailsView, useEventDetailsViewModel } from "@/features/event-details";

export function EventDetailContent({ id }: { id: string }) {
  const vm = useEventDetailsViewModel(id);
  return <EventDetailsView {...vm} />;
}
