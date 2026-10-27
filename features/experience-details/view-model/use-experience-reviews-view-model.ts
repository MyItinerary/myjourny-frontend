import { useMemo, useState } from "react";

import type { ExperienceReview, ExperienceReviewsData } from "../model/experience-details.types";

export type ReviewSort = "relevant" | "highest" | "lowest";

export const REVIEW_SORT_LABELS: Record<ReviewSort, string> = {
  relevant: "Most relevant",
  highest: "Highest rated",
  lowest: "Lowest rated",
};

const PAGE_SIZE = 3;

export type ReviewRow = ExperienceReview & {
  /** The visitor marked it helpful. */
  voted: boolean;
  helpfulCount: number;
};

export type ExperienceReviewsViewModel = {
  average: number;
  count: number;
  breakdown: ExperienceReviewsData["breakdown"];
  summary: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  /** 0 for every rating, otherwise only reviews with that many stars. */
  ratingFilter: number;
  onRatingFilterChange: (rating: number) => void;
  rows: ReviewRow[];
  /** What to say when the search or filter finds nothing. */
  emptyMessage: string | null;
  /** "Show 10 more reviews"; null when everything is showing. */
  showMoreLabel: string | null;
  onShowMore: () => void;
  onToggleHelpful: (id: string) => void;
};

/** Search, sort, filter and paging for the reviews section. Helpful votes
 * stay on this device until reviews can be saved. */
export function useExperienceReviewsViewModel(data: ExperienceReviewsData): ExperienceReviewsViewModel {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ReviewSort>("relevant");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = data.reviews.filter(
      (review) =>
        (ratingFilter === 0 || review.rating === ratingFilter) &&
        (needle === "" || `${review.text} ${review.name}`.toLowerCase().includes(needle)),
    );
    if (sort === "highest") return [...found].sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") return [...found].sort((a, b) => a.rating - b.rating);
    return found;
  }, [data.reviews, query, ratingFilter, sort]);

  const shown = matches.slice(0, visible);
  const hiddenLocally = matches.length - shown.length;

  return {
    average: data.average,
    count: data.count,
    breakdown: data.breakdown,
    summary: data.summary,
    query,
    onQueryChange: (value) => {
      setQuery(value);
      setVisible(PAGE_SIZE);
    },
    sort,
    onSortChange: setSort,
    ratingFilter,
    onRatingFilterChange: (rating) => {
      setRatingFilter(rating);
      setVisible(PAGE_SIZE);
    },
    rows: shown.map((review) => ({
      ...review,
      voted: voted.has(review.id),
      helpfulCount: review.helpfulCount + (voted.has(review.id) ? 1 : 0),
    })),
    emptyMessage:
      matches.length === 0 ? (query.trim() ? `No reviews mention "${query.trim()}".` : "No reviews match that filter.") : null,
    // Only the reviews on hand can be shown; the count says how many exist.
    showMoreLabel:
      hiddenLocally > 0
        ? `Show ${Math.min(hiddenLocally, PAGE_SIZE)} more review${Math.min(hiddenLocally, PAGE_SIZE) === 1 ? "" : "s"}`
        : null,
    onShowMore: () => setVisible((v) => v + PAGE_SIZE),
    onToggleHelpful: (id) =>
      setVoted((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
  };
}
