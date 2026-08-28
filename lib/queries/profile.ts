"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type ProfileUpdatePayload = {
  energy_level?: string;
  interests?: string[];
  social_style?: string;
  budget_range?: string;
  trip_intent?: string[];
  completed?: boolean;
};

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      // PUT /profile/me returns {"message": "..."}, not the profile itself
      // — don't type this as UserProfileOut, nothing here reads it back.
      const { data } = await apiClient.put<{ message: string }>("/profile/me", payload);
      return data;
    },
  });
}
