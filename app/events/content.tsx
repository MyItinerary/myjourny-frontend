"use client";

import { EventsPageView, useEventsPageViewModel } from "@/features/discovery";

export function EventsContent() {
  const vm = useEventsPageViewModel();
  return <EventsPageView {...vm} />;
}
