"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type Category = {
  id: number;
  parent_id: number | null;
  slug: string;
  text: string;
  weight: number;
  category_type: string;
  is_active: boolean;
};

// Mirrors mobile-app's `useCategories` (src/api/queries.ts): `initialData`
// renders instantly with a known-good local fallback (same slugs itin
// seeds), while the live GET /categories reconciles in the background —
// no loading state, no network wait, but still using the real fetch as
// source of truth per mobile-app's proven pattern.
//
// initialDataUpdatedAt: 0 is load-bearing, not decorative — without it,
// React Query treats `initialData` as freshly-fetched for the whole
// staleTime window and never actually calls the backend on mount. Caught
// this the hard way: no /categories request was showing up in the network
// tab at all.
export function useCategories(categoryType: string, fallback: Category[]) {
  return useQuery({
    queryKey: ["categories", categoryType],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories", {
        params: { category_type: categoryType },
      });
      return data;
    },
    initialData: fallback,
    initialDataUpdatedAt: 0,
    staleTime: 5 * 60_000,
  });
}
