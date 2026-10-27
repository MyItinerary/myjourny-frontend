import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { EventDetail } from "./event-details.types";
import { SAMPLE_EVENT, SAMPLE_EVENT_ID } from "./sample-event";

/** GET /events/{id}. `sample` is served locally until the endpoint exists. */
export async function fetchEvent(id: string): Promise<EventDetail> {
  if (id === SAMPLE_EVENT_ID) return SAMPLE_EVENT;
  const { data } = await apiClient.get<EventDetail>(`/events/${id}`);
  return data;
}

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: ["events", "detail", id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  });
}
