import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { ExperienceDetail } from "./experience-detail.types";

export const experienceDetailQueryKey = (id: string) => ["experiences", "detail", id] as const;

/** One experience, as its page and booking screens show it. */
export function useExperienceDetail(id: string) {
  return useQuery({
    queryKey: experienceDetailQueryKey(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ExperienceDetail>(`/experiences/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
