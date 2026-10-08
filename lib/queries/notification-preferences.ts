"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

// GET/PUT /notifications/preferences: { type: { email, push, in_app } }.
// PUT merges whatever it's sent into what's stored, so a single toggle can
// be sent on its own. Booking confirmations and cancellations/refunds are
// always on (itin forces them back to true).
export const NOTIFICATION_TYPES = [
  "pre_trip_reminder",
  "safety_alert",
  "itinerary_update",
  "booking_confirmations",
  "cancellations_refunds",
  "payment_status",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationChannel = "email" | "push" | "in_app";
export type NotificationPreferences = Record<NotificationType, Record<NotificationChannel, boolean>>;

export const LOCKED_NOTIFICATION_TYPES: ReadonlySet<NotificationType> = new Set([
  "booking_confirmations",
  "cancellations_refunds",
]);

const KEY = ["notifications", "preferences"] as const;

export function useNotificationPreferences() {
  const { user } = useSession();
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiClient.get<NotificationPreferences>("/notifications/preferences")).data,
    enabled: !!user,
  });
}

type Change = Partial<Record<NotificationType, Partial<Record<NotificationChannel, boolean>>>>;

// Optimistic: the toggle flips straight away and rolls back if itin refuses.
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (change: Change) =>
      (await apiClient.put<NotificationPreferences>("/notifications/preferences", change)).data,
    onMutate: async (change) => {
      await queryClient.cancelQueries({ queryKey: KEY });
      const previous = queryClient.getQueryData<NotificationPreferences>(KEY);
      if (previous) {
        const next = structuredClone(previous);
        for (const [type, channels] of Object.entries(change) as [NotificationType, Change[NotificationType]][]) {
          next[type] = { ...next[type], ...channels };
        }
        queryClient.setQueryData(KEY, next);
      }
      return { previous };
    },
    onError: (error, _change, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous);
      toast.error(apiErrorMessage(error, "Couldn't save your notification settings."));
    },
    onSuccess: (saved) => queryClient.setQueryData(KEY, saved),
  });
}
