"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

// GET /users/{userId} — Fetch public profile for user or guide
export type PublicUser = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  headline?: string | null;
  about?: string | null;
  is_verified?: boolean;
  rating_avg?: number | null;
  languages?: string[];
  city?: string | null;
  country?: string | null;
  created_at?: string;
};

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<PublicUser>(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });
}
