"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";

// itin has two saved-experience APIs: /saved/ (flat per-user list, used
// here) and /wishlists/ (named collections, Pinterest-board style). This
// app's UI is a plain heart toggle with no collection-picking anywhere,
// so /saved/ is the right fit — /wishlists/ would need collection-
// management UI that doesn't exist and wasn't asked for.
type SavedExperienceOut = {
  experienceId: string;
};

const SAVED_IDS_KEY = ["saved", "experience-ids"] as const;

export function useSavedExperienceIds() {
  return useQuery({
    queryKey: SAVED_IDS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<SavedExperienceOut[]>("/saved/", {
        params: { limit: 200 },
      });
      return new Set(data.map((item) => item.experienceId));
    },
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ experienceId, isSaved }: { experienceId: string; isSaved: boolean }) => {
      if (isSaved) {
        await apiClient.delete(`/saved/${experienceId}`);
      } else {
        await apiClient.post("/saved/", { experienceId });
      }
    },
    onMutate: async ({ experienceId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: SAVED_IDS_KEY });
      const previous = queryClient.getQueryData<Set<string>>(SAVED_IDS_KEY);
      queryClient.setQueryData<Set<string>>(SAVED_IDS_KEY, (current) => {
        const next = new Set(current ?? []);
        if (isSaved) next.delete(experienceId);
        else next.add(experienceId);
        return next;
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(SAVED_IDS_KEY, context.previous);
      toast.error("Couldn't update your wishlist. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_IDS_KEY });
    },
  });
}
