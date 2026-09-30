"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { clearAuth, useSession } from "@/lib/auth/session-store";
import { clearPreferences, setPreference } from "@/lib/onboarding/preferences-store";

export type ProfileUpdatePayload = {
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  energy_level?: string;
  interests?: string[];
  social_style?: string;
  budget_range?: string;
  trip_intent?: string[];
  preferred_currency?: string;
  preferred_language?: string;
  completed?: boolean;
};

export type UserProfile = {
  id?: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  energy_level?: string | null;
  interests?: string[] | null;
  social_style?: string | null;
  budget_range?: string | null;
  trip_intent?: string[] | null;
  preferred_currency?: string | null;
  preferred_language?: string | null;
  completed?: boolean;
};

export function useGetProfile() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<UserProfile>("/profile/me");
        return data;
      } catch {
        try {
          const { data } = await apiClient.get<UserProfile>("/users/profile");
          return data;
        } catch {
          const { data } = await apiClient.get<UserProfile>("/auth/me");
          return data;
        }
      }
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const { data } = await apiClient.put<{ message: string }>("/profile/me", payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      if (variables.energy_level !== undefined) {
        setPreference("energyLevel", variables.energy_level);
      }
      if (variables.interests !== undefined) {
        setPreference("interests", variables.interests);
      }
      if (variables.social_style !== undefined) {
        setPreference("socialStyle", variables.social_style);
      }
      if (variables.budget_range !== undefined) {
        setPreference("budgetRange", variables.budget_range);
      }
      if (variables.trip_intent !== undefined) {
        setPreference("tripIntent", variables.trip_intent);
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete("/auth/me");
      return data;
    },
    onSuccess: () => {
      clearAuth();
      clearPreferences();
      queryClient.clear();
      if (typeof window !== "undefined") {
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
        window.location.href = "/";
      }
    },
  });
}

export function useGetBookings() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["bookings", "user"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<unknown[]>("/bookings");
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    enabled: !!user,
  });
}
