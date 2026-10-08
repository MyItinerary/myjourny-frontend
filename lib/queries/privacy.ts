"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

// Profile visibility, review and personalisation toggles are profile
// fields (useUpdateProfile). This covers blocked users and data exports.

const PRIVACY_KEY = ["privacy"] as const;

export type BlockedUser = { id: string; name: string | null; avatar: string | null; blocked_at: string };

export function useBlockedUsers() {
  const { user } = useSession();
  return useQuery({
    queryKey: [...PRIVACY_KEY, "blocked"],
    queryFn: async () => (await apiClient.get<BlockedUser[]>("/privacy/blocked")).data,
    enabled: !!user,
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/privacy/blocked/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PRIVACY_KEY, "blocked"] });
      // Their experiences show up in listings again.
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't unblock them.")),
  });
}

// The export is built in the background and emailed as a link that works
// for 7 days. Requesting again while one is in progress returns that job.
export type DataExportJob = { job_id: string; status: string; created_at: string };

export function useLatestDataExport() {
  const { user } = useSession();
  return useQuery({
    queryKey: [...PRIVACY_KEY, "data-export"],
    queryFn: async () => {
      try {
        return (await apiClient.get<DataExportJob>("/privacy/data-export")).data;
      } catch (error) {
        // No export requested yet.
        if ((error as { response?: { status?: number } })?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!user,
  });
}

export function useRequestDataExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await apiClient.post<DataExportJob>("/privacy/data-export")).data,
    onSuccess: (job) => queryClient.setQueryData([...PRIVACY_KEY, "data-export"], job),
    onError: (error) => toast.error(apiErrorMessage(error, "Couldn't request your data.")),
  });
}
