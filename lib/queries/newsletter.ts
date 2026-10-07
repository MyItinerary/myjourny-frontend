"use client";

import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

// Public — guests can subscribe too. itin answers the same way for new and
// existing addresses, so there's no "already subscribed" state to show.
export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async ({ email, source }: { email: string; source?: string }) => {
      await apiClient.post("/newsletter/subscribe", { email, source });
    },
  });
}
