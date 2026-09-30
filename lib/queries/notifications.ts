"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/lib/auth/session-store";

export type NotificationCategory = "bookings" | "payments" | "tips";

export type NotificationOut = {
  id: number;
  user_id: string;
  type:
    | "pre_trip_reminder"
    | "safety_alert"
    | "itinerary_update"
    | "booking_status"
    | "payment_status";
  title: string;
  body: string | null;
  channel: string;
  status: string;
  scheduled_for: string | null;
  sent_at: string | null;
  read_at: string | null;
  meta_info: Record<string, string> | null;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  dateGroup: string;
  unread: boolean;
  category: NotificationCategory;
  iconType: "booking" | "reminder" | "payment" | "saved" | "tip" | "schedule";
  raw: NotificationOut;
};

const TYPE_MAP: Record<
  NotificationOut["type"],
  { category: NotificationCategory; iconType: NotificationItem["iconType"] }
> = {
  booking_status: { category: "bookings", iconType: "booking" },
  payment_status: { category: "payments", iconType: "payment" },
  pre_trip_reminder: { category: "bookings", iconType: "reminder" },
  itinerary_update: { category: "bookings", iconType: "schedule" },
  safety_alert: { category: "tips", iconType: "schedule" },
};

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function formatDateGroup(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays <= 7) return "This week";
  return "Earlier";
}

export function mapNotificationOut(n: NotificationOut): NotificationItem {
  const mapped = TYPE_MAP[n.type] ?? {
    category: "tips" as const,
    iconType: "tip" as const,
  };
  return {
    id: String(n.id),
    title: n.title,
    message: n.body ?? "",
    time: formatRelativeTime(n.created_at),
    dateGroup: formatDateGroup(n.created_at),
    unread: !n.read_at,
    category: mapped.category,
    iconType: mapped.iconType,
    raw: n,
  };
}

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export function useNotifications(params?: { limit?: number; offset?: number }) {
  const { user } = useSession();
  const limit = params?.limit ?? 50;
  const offset = params?.offset ?? 0;

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, limit, offset],
    queryFn: async () => {
      const { data } = await apiClient.get<NotificationOut[]>("/notifications/", {
        params: { limit, offset },
      });
      return Array.isArray(data) ? data.map(mapNotificationOut) : [];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationsCount() {
  const { data: notifications } = useNotifications({ limit: 100 });
  return notifications?.filter((n) => n.unread).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<NotificationOut>(
        `/notifications/${id}/read`
      );
      return data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) =>
          old?.map((n) => (n.id === id ? { ...n, unread: false } : n)) ?? []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => old?.map((n) => ({ ...n, unread: false })) ?? []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notifications/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.setQueriesData<NotificationItem[]>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => old?.filter((n) => n.id !== id) ?? []
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
