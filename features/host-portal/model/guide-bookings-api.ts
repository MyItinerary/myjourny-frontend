import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { GuideBooking } from "./guide-bookings.types";

/** Every booking on the guide's listings, newest session first. */
export function useGuideBookings(enabled: boolean) {
  return useQuery({
    queryKey: ["guide", "bookings"],
    queryFn: async () => (await apiClient.get<GuideBooking[]>("/bookings/guide")).data,
    enabled,
  });
}
