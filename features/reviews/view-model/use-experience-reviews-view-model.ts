import { reviewDate, useExperienceReviews } from "../model/reviews";

export type ReviewCard = {
  id: string;
  author: string;
  avatarUrl: string | null;
  initial: string;
  rating: number;
  comment: string | null;
  date: string;
};

export type ExperienceReviewsViewModel = {
  /** "4.8", or null before the first review. */
  rating: string | null;
  /** "12 reviews"; null when there are none. */
  countLabel: string | null;
  reviews: ReviewCard[];
  hasMore: boolean;
  loadingMore: boolean;
  onShowMore: () => void;
};

/** The reviews section of an experience page: the average, how many, and the
 * written reviews a few at a time. */
export function useExperienceReviewsViewModel(
  experienceId: string,
  experience?: { rating?: number | null; review_count?: number | null } | null,
): ExperienceReviewsViewModel {
  const query = useExperienceReviews(experienceId);
  const pages = query.data?.pages ?? [];
  const total = pages[0]?.total ?? experience?.review_count ?? 0;
  const average = pages[0]?.rating ?? experience?.rating ?? null;

  const reviews = pages.flatMap((page) =>
    (page.items ?? []).map((review) => ({
      id: review.id,
      author: review.author_name,
      avatarUrl: review.author_avatar_url ?? null,
      initial: review.author_name.charAt(0).toUpperCase(),
      rating: review.rating,
      comment: review.comment ?? null,
      date: reviewDate(review.created_at),
    })),
  );

  return {
    rating: average != null && total > 0 ? average.toFixed(1) : null,
    countLabel: total > 0 ? `${total} review${total === 1 ? "" : "s"}` : null,
    reviews,
    hasMore: !!query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    onShowMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage();
    },
  };
}
