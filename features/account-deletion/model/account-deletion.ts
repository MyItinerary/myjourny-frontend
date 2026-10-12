import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { BlockerNote, DeletionBlockers, DeletionPreview } from "./account-deletion.types";

export const DELETION_PREVIEW_KEY = ["account", "deletion-preview"] as const;

/** What blocks deletion right now. Only fetched while `enabled`. */
export function useDeletionPreview(enabled: boolean) {
  return useQuery({
    queryKey: DELETION_PREVIEW_KEY,
    queryFn: async () => (await apiClient.get<DeletionPreview>("/auth/me/deletion-preview")).data,
    enabled,
    // Bookings and refunds change elsewhere; always ask again.
    staleTime: 0,
  });
}

/** DELETE /auth/me: removes the person's details and keeps booking and
 * payment records. Answers 409 with `blockers` while something is unresolved. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/auth/me");
    },
  });
}

/** The blockers a 409 from DELETE /auth/me carries, if that's what this is. */
export function blockersFromError(error: unknown): DeletionBlockers | null {
  const response = (error as { response?: { status?: number; data?: { blockers?: DeletionBlockers } } })?.response;
  return response?.status === 409 && response.data?.blockers ? response.data.blockers : null;
}

export function previewBlockers(preview: DeletionPreview | undefined): DeletionBlockers {
  return (
    preview?.blockers ?? {
      upcoming_bookings: preview?.upcoming_booking_count ?? 0,
      open_refund_requests: 0,
      hosted_upcoming_bookings: 0,
      pending_payouts: 0,
    }
  );
}

/** Each blocker as a short note saying what to do about it. */
export function describeBlockers(blockers: DeletionBlockers): BlockerNote[] {
  const notes: BlockerNote[] = [];
  const upcoming = blockers.upcoming_bookings;
  if (upcoming > 0) {
    notes.push({
      key: "upcoming",
      title: `You have ${upcoming === 1 ? "an upcoming booking" : `${upcoming} upcoming bookings`}`,
      body: `Cancel ${upcoming === 1 ? "it" : "them"} first, so the host knows and any refund can follow the cancellation policy.`,
    });
  }
  const refunds = blockers.open_refund_requests;
  if (refunds > 0) {
    notes.push({
      key: "refunds",
      title: refunds === 1 ? "A refund is still being reviewed" : `${refunds} refunds are still being reviewed`,
      body: "You can delete your account as soon as we've finished. Nothing more is needed from you.",
    });
  }
  if (blockers.hosted_upcoming_bookings > 0 || blockers.pending_payouts > 0) {
    notes.push({
      key: "hosting",
      title: "Your experiences still have bookings or payouts to settle",
      body: "Contact support and we'll help you close them, then you can delete your account.",
    });
  }
  return notes;
}
