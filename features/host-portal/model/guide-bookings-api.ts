import { useInfiniteQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { GuideBookingsPage } from "./guide-bookings.types";

/** Every booking on the guide's listings, newest session first. */
export function useGuideBookings(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["guide", "bookings"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (await apiClient.get<GuideBookingsPage>("/bookings/guide", { params: { page: pageParam } })).data,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.page + 1 : undefined),
    enabled,
  });
}
