"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
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
  // Account settings. Email and phone change through their own verified
  // flows below; itin rejects them here.
  legal_name?: string | null;
  preferred_name?: string | null;
  display_name_preference?: DisplayNamePreference;
  emergency_contact_name?: string | null;
  /** E.164, e.g. +2348012345678 */
  emergency_contact_phone?: string | null;
  city?: string | null;
  home_country?: string | null;
  date_of_birth?: string | null;
  /** IANA name, e.g. Africa/Lagos */
  timezone?: string | null;
  profile_visibility?: ProfileVisibility;
  show_reviews_publicly?: boolean;
  personalization_enabled?: boolean;
};

export type DisplayNamePreference = "full" | "first_name_only";
export type ProfileVisibility = "public" | "hosts_booked";

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
  legal_name?: string | null;
  preferred_name?: string | null;
  display_name_preference?: DisplayNamePreference | null;
  phone_number?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  city?: string | null;
  home_country?: string | null;
  date_of_birth?: string | null;
  timezone?: string | null;
  profile_visibility?: ProfileVisibility;
  show_reviews_publicly?: boolean;
  personalization_enabled?: boolean;
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

// After the account is deleted or deactivated: drop the session here too
// and start over from the home page.
export function signOutLocally(queryClient: QueryClient) {
  clearAuth();
  clearPreferences();
  queryClient.clear();
  if (typeof window !== "undefined") {
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    window.location.href = "/";
  }
}

// Phone: a 6-digit code goes to the account's current email, then the
// confirm call sets the new number. Email: a link goes to the new address,
// opening /profile/email/confirm?token=…
type Message = { message: string };

export function useRequestPhoneChange() {
  return useMutation({
    mutationFn: async (newPhone: string) => {
      const { data } = await apiClient.post<Message>("/profile/phone/request-change", {
        new_phone: newPhone,
      });
      return data;
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't send the code.")),
  });
}

export function useConfirmPhoneChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (otp: string) => {
      const { data } = await apiClient.post<Message>("/profile/phone/confirm", { otp });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
    onError: (error) => toast.error(apiErrorMessage(error, "That code didn't work.")),
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: async (newEmail: string) => {
      const { data } = await apiClient.post<Message>("/profile/email/request-change", {
        new_email: newEmail,
      });
      return data;
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't send the confirmation email.")),
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.get<Message>("/profile/email/confirm", { params: { token } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
