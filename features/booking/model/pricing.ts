import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ExperiencePricing, PricingSelection, Quote } from "./booking.types";

export function useExperiencePricing(experienceId: string) {
  return useQuery({
    queryKey: ["experiences", "pricing", experienceId],
    queryFn: async () => {
      const { data } = await apiClient.get<ExperiencePricing>(`/experiences/${experienceId}/pricing`);
      return data;
    },
    enabled: !!experienceId,
  });
}

/** POST /bookings/quote: the server prices the selection with the same engine
 * that prices the booking, so the total shown is the total charged. */
export function useBookingQuote(selection: PricingSelection | null) {
  return useQuery({
    queryKey: ["bookings", "quote", selection],
    queryFn: async () => {
      const { data } = await apiClient.post<Quote>("/bookings/quote", selection);
      return data;
    },
    enabled: !!selection && selection.items.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });
}
