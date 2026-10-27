import { useState } from "react";

import {
  avatarTone,
  EARLY_REVIEWS_LIMIT,
  filterReviews,
  isLongReview,
  ratingBarWidth,
  REVIEW_SORT_OPTIONS,
  REVIEWS_PAGE_SIZE,
  reviewInitials,
  reviewMonth,
  sortReviews,
  useExperienceReviews,
} from "../model/reviews";
import {
  MOCK_RATING_BREAKDOWN,
  MOCK_REVIEW_RATING,
  MOCK_REVIEW_SUMMARY,
  MOCK_REVIEW_TOTAL,
  MOCK_REVIEWS,
} from "../model/reviews-mock";
import type { AvatarTone, HostReply, ReviewSort } from "../model/reviews.types";

export type ReviewCard = {
  id: string;
  author: string;
  avatarUrl: string | null;
  initials: string;
  tone: AvatarTone;
  rating: number;
  comment: string | null;
  /** "August 2026". */
  date: string;
  verified: boolean;
  hostReply: HostReply | null;
  /** Long reviews are cut short behind "Read more". */
  long: boolean;
  /** Cut short right now. */
  clamped: boolean;
  helpfulCount: number;
  voted: boolean;
};

/** Which version of the section to show. */
export type ReviewsDisplay = "loading" | "error" | "new" | "early" | "noResults" | "populated";

export type ReviewsBreakdownRow = { label: string; value: string; width: string };

export type ExperienceReviewsViewModel = {
  display: ReviewsDisplay;
  /** "4.8", or null before the first review. */
  rating: string | null;
  /** "12 reviews"; null when there are none. */
  countLabel: string | null;
  /** Host / Value / Organisation. Empty when there is no breakdown to show. */
  breakdown: ReviewsBreakdownRow[];
  summary: string | null;
  reviews: ReviewCard[];

  query: string;
  onQueryChange: (query: string) => void;
  onClearQuery: () => void;

  sort: ReviewSort;
  sortLabel: string;
  sortOptions: { value: ReviewSort; label: string }[];
  sortOpen: boolean;
  onToggleSort: () => void;
  onSortChange: (sort: ReviewSort) => void;

  filterOpen: boolean;
  onToggleFilter: () => void;
  ratingFilter: number | null;
  onRatingFilter: (rating: number | null) => void;
  activeFilterCount: number;
  onClearFilters: () => void;

  onToggleHelpful: (id: string) => void;
  onToggleExpanded: (id: string) => void;

  hasMore: boolean;
  loadingMore: boolean;
  /** "Show 10 more reviews". */
  moreLabel: string;
  onShowMore: () => void;
  onRetry: () => void;
};

function toggle(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];
}

/** The reviews section of an experience page: the score, what people say, search,
 * sort and filter, and the written reviews a few at a time.
 *
 * `preview` fills an experience that has no reviews with sample ones, so the
 * redesigned section can be seen before the API serves everything it needs. */
export function useExperienceReviewsViewModel(
  experienceId: string,
  experience?: { rating?: number | null; review_count?: number | null } | null,
  options: { preview?: boolean } = {},
): ExperienceReviewsViewModel {
  const query = useExperienceReviews(experienceId);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ReviewSort>("relevant");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [voted, setVoted] = useState<string[]>([]);

  const pages = query.data?.pages ?? [];
  const apiItems = pages.flatMap((page) => page.items ?? []);
  const usePreview = !!options.preview && !query.isPending && !query.isError && apiItems.length === 0;

  const items = usePreview ? MOCK_REVIEWS : apiItems;
  const total = usePreview ? MOCK_REVIEW_TOTAL : (pages[0]?.total ?? experience?.review_count ?? 0);
  const average = usePreview ? MOCK_REVIEW_RATING : (pages[0]?.rating ?? experience?.rating ?? null);

  const visible = sortReviews(filterReviews(items, search, ratingFilter), sort);

  const reviews: ReviewCard[] = visible.map((review) => ({
    id: review.id,
    author: review.author_name,
    avatarUrl: review.author_avatar_url ?? null,
    initials: reviewInitials(review.author_name),
    tone: avatarTone(review.author_name),
    rating: review.rating,
    comment: review.comment ?? null,
    date: reviewMonth(review.created_at),
    verified: review.verified ?? true,
    hostReply: review.host_reply ?? null,
    long: isLongReview(review.comment),
    clamped: isLongReview(review.comment) && !expanded.includes(review.id),
    helpfulCount: (review.helpful_count ?? 0) + (voted.includes(review.id) ? 1 : 0),
    voted: voted.includes(review.id),
  }));

  let display: ReviewsDisplay = "populated";
  if (query.isPending) display = "loading";
  else if (query.isError) display = "error";
  else if (total === 0 && items.length === 0) display = "new";
  else if (reviews.length === 0) display = "noResults";
  else if (total < EARLY_REVIEWS_LIMIT) display = "early";

  const hasMore = usePreview ? false : !!query.hasNextPage;
  const remaining = Math.max(0, total - items.length);
  const filtering = search.trim() !== "" || ratingFilter != null;
  const showScore = display === "populated" || (display === "noResults" && total >= EARLY_REVIEWS_LIMIT);

  return {
    display,
    rating: average != null && total > 0 ? average.toFixed(1) : null,
    countLabel: total > 0 ? `${total} review${total === 1 ? "" : "s"}` : null,
    breakdown: showScore && usePreview
      ? MOCK_RATING_BREAKDOWN.map((row) => ({ label: row.label, value: row.value.toFixed(1), width: ratingBarWidth(row.value) }))
      : [],
    summary: showScore && usePreview ? MOCK_REVIEW_SUMMARY : null,
    reviews,

    query: search,
    onQueryChange: setSearch,
    onClearQuery: () => setSearch(""),

    sort,
    sortLabel: REVIEW_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "",
    sortOptions: REVIEW_SORT_OPTIONS,
    sortOpen,
    onToggleSort: () => {
      setSortOpen((open) => !open);
      setFilterOpen(false);
    },
    onSortChange: (next) => {
      setSort(next);
      setSortOpen(false);
    },

    filterOpen,
    onToggleFilter: () => {
      setFilterOpen((open) => !open);
      setSortOpen(false);
    },
    ratingFilter,
    onRatingFilter: setRatingFilter,
    activeFilterCount: ratingFilter != null ? 1 : 0,
    onClearFilters: () => {
      setRatingFilter(null);
      setSearch("");
    },

    onToggleHelpful: (id) => setVoted((current) => toggle(current, id)),
    onToggleExpanded: (id) => setExpanded((current) => toggle(current, id)),

    hasMore: hasMore && !filtering,
    loadingMore: query.isFetchingNextPage,
    moreLabel: `Show ${Math.min(remaining || REVIEWS_PAGE_SIZE, REVIEWS_PAGE_SIZE)} more reviews`,
    onShowMore: () => {
      if (!query.isFetchingNextPage) query.fetchNextPage();
    },
    onRetry: () => {
      query.refetch();
    },
  };
}
