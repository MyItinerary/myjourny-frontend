import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { BookingReviewStatus, ExperienceReviewsPage, MyReview, ReviewInput } from "./reviews.types";

export const REVIEWS_PAGE_SIZE = 6;
export const MAX_COMMENT_LENGTH = 2000;

/** Visible reviews of an experience, newest first, a page at a time. */
export function useExperienceReviews(experienceId: string) {
  return useInfiniteQuery({
    queryKey: ["reviews", "experience", experienceId],
    enabled: !!experienceId,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      (
        await apiClient.get<ExperienceReviewsPage>(`/experiences/${experienceId}/reviews`, {
          params: { page: pageParam, limit: REVIEWS_PAGE_SIZE },
        })
      ).data,
    getNextPageParam: (last) => (last?.page && last.page * last.limit < last.total ? last.page + 1 : undefined),
  });
}

/** Whether the signed-in traveller can review this booking, and their review if they have. */
export function useBookingReview(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: ["reviews", "booking", bookingId],
    enabled: !!bookingId && enabled,
    queryFn: async () => (await apiClient.get<BookingReviewStatus>(`/bookings/${bookingId}/review`)).data,
  });
}

function toPayload(input: ReviewInput) {
  return { rating: input.rating, comment: input.comment.trim() || null };
}

/** Posts a new review, or edits the traveller's existing one. */
export function useSaveReview(bookingId: string, experienceId?: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ input, reviewId }: { input: ReviewInput; reviewId?: string }) =>
      reviewId
        ? (await apiClient.patch<MyReview>(`/reviews/${reviewId}`, toPayload(input))).data
        : (await apiClient.post<MyReview>(`/bookings/${bookingId}/review`, toPayload(input))).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "booking", bookingId] });
      if (experienceId) {
        queryClient.invalidateQueries({ queryKey: ["reviews", "experience", experienceId] });
      }
    },
  });
}

/** "12 Oct 2026". */
export function reviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Can the author still change it? */
export function isEditable(review: MyReview, now: Date = new Date()): boolean {
  return new Date(review.editable_until).getTime() > now.getTime();
}
