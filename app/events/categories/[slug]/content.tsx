"use client";

import { EventCategoryView, useEventCategoryViewModel } from "@/features/event-categories";

export function EventCategoryContent({ slug }: { slug: string }) {
  const vm = useEventCategoryViewModel(slug);
  return <EventCategoryView {...vm} />;
}
