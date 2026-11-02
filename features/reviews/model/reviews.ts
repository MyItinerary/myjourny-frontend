import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type {
  BookingReviewStatus,
  ExperienceReviewsPage,
  AvatarTone,
  MyReview,
  PublicReview,
  ReviewInput,
  ReviewSort,
} from "./reviews.types";

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

/** "August 2026". */
export function reviewMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** "Ngozi A." becomes "NA"; one name becomes one letter. */
export function reviewInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

const AVATAR_TONES: AvatarTone[] = ["sand", "blue", "cream", "amber"];

/** The same author always gets the same avatar colour. */
export function avatarTone(name: string): AvatarTone {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

export const REVIEW_SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export const EARLY_REVIEWS_LIMIT = 5;
export const CLAMP_AFTER_CHARS = 240;

/** Long reviews are cut short behind a "Read more". */
export function isLongReview(comment: string | null | undefined): boolean {
  return (comment?.length ?? 0) > CLAMP_AFTER_CHARS;
}

/** Reviews that match the search text (author or comment) and the star filter. */
export function filterReviews(reviews: PublicReview[], query: string, rating: number | null): PublicReview[] {
  const needle = query.trim().toLowerCase();
  return reviews.filter((review) => {
    if (rating != null && review.rating !== rating) return false;
    if (!needle) return true;
    return `${review.author_name} ${review.comment ?? ""}`.toLowerCase().includes(needle);
  });
}

/** "Most relevant" keeps the order the API gave us. */
export function sortReviews(reviews: PublicReview[], sort: ReviewSort): PublicReview[] {
  const sorted = [...reviews];
  if (sort === "newest") sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (sort === "highest") sorted.sort((a, b) => b.rating - a.rating);
  if (sort === "lowest") sorted.sort((a, b) => a.rating - b.rating);
  return sorted;
}

/** Width of a rating bar's fill, value out of 5. */
export function ratingBarWidth(value: number): string {
  return `${Math.min(100, Math.max(0, (value / 5) * 100))}%`;
}
