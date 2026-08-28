"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth/session-store";

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

// GET /categories?category_type=interest — the "Discover by categories"
// taxonomy (7 parents/21 children via parent_id). Unlike useCategories
// above (which has a safe local fallback for the 4 onboarding
// category_types), there's no local fallback here — it's auth-only, only
// fetched when signed in, same as every other real-data endpoint.
export function useInterestCategories() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["categories", "interest"],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories", {
        params: { category_type: "interest" },
      });
      return data;
    },
    enabled: user !== null,
  });
}

// Groups the flat list into parent-slug -> children, since a child only
// carries its parent's numeric id, not the parent's slug directly.
export function groupChildrenByParentSlug(categories: Category[]): Map<string, Category[]> {
  const slugById = new Map<number, string>();
  for (const category of categories) {
    if (category.parent_id === null) slugById.set(category.id, category.slug);
  }

  const grouped = new Map<string, Category[]>();
  for (const category of categories) {
    if (category.parent_id === null) continue;
    const parentSlug = slugById.get(category.parent_id);
    if (!parentSlug) continue;
    const existing = grouped.get(parentSlug) ?? [];
    existing.push(category);
    grouped.set(parentSlug, existing);
  }
  return grouped;
}
