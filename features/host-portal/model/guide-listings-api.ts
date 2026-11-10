import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { useInterestCategories } from "@/lib/queries/categories";

import type { CategoryNames, GuideExperience } from "./guide-listings.types";

const LISTINGS_KEY = ["guide", "experiences"] as const;

/** The guide's own listings, whatever their status. */
export function useGuideExperiences(enabled: boolean) {
  return useQuery({
    queryKey: LISTINGS_KEY,
    queryFn: async () => (await apiClient.get<GuideExperience[]>("/guide/experiences")).data,
    enabled,
  });
}

/** One of the guide's listings; the public page only has live ones. */
export function useGuideExperience(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...LISTINGS_KEY, id],
    queryFn: async () => (await apiClient.get<GuideExperience>(`/guide/experiences/${id}`)).data,
    enabled,
  });
}

export function useDeleteGuideExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/experiences/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LISTINGS_KEY }),
  });
}

/** Interest category and subcategory names by slug. */
export function useCategoryNames(): CategoryNames {
  const { data } = useInterestCategories({ tree: true });
  const names: CategoryNames = {};
  for (const category of data ?? []) {
    names[category.slug] = category.text;
    for (const child of category.children ?? []) names[child.slug] = child.text;
  }
  return names;
}
