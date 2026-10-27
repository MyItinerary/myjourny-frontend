import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ExperienceReview, ExperienceReviewsData } from "../model/experience-details.types";
import { useExperienceReviewsViewModel } from "./use-experience-reviews-view-model";

const review = (id: string, rating: number, text: string): ExperienceReview => ({
  id,
  initials: id.slice(0, 2).toUpperCase(),
  name: `Guest ${id}`,
  date: "July 2026",
  rating,
  text,
  verified: true,
  helpfulCount: 2,
  tone: "sand",
});

const data: ExperienceReviewsData = {
  average: 4.5,
  count: 40,
  breakdown: [{ label: "Host", value: 4.9 }],
  summary: "Guests liked it.",
  reviews: [
    review("a", 3, "Cold on the water"),
    review("b", 5, "Breakfast on the jetty"),
    review("c", 4, "Easy to find"),
    review("d", 5, "Small group"),
    review("e", 1, "Late start"),
  ],
};

const render = () => renderHook(() => useExperienceReviewsViewModel(data));

describe("useExperienceReviewsViewModel", () => {
  it("shows the score and the first page of reviews", () => {
    const { result } = render();
    expect(result.current).toMatchObject({ average: 4.5, count: 40, summary: "Guests liked it." });
    expect(result.current.rows.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(result.current.showMoreLabel).toBe("Show 2 more reviews");
  });

  it("shows more reviews until none are left", () => {
    const { result } = render();
    act(() => result.current.onShowMore());
    expect(result.current.rows).toHaveLength(5);
    expect(result.current.showMoreLabel).toBeNull();
  });

  it("sorts by rating", () => {
    const { result } = render();
    act(() => result.current.onSortChange("highest"));
    expect(result.current.rows.map((r) => r.rating)).toEqual([5, 5, 4]);
    act(() => result.current.onSortChange("lowest"));
    expect(result.current.rows.map((r) => r.rating)).toEqual([1, 3, 4]);
  });

  it("filters by rating", () => {
    const { result } = render();
    act(() => result.current.onRatingFilterChange(5));
    expect(result.current.rows.map((r) => r.id)).toEqual(["b", "d"]);
    expect(result.current.showMoreLabel).toBeNull();
  });

  it("searches the text and the name, and says when nothing matches", () => {
    const { result } = render();
    act(() => result.current.onQueryChange("jetty"));
    expect(result.current.rows.map((r) => r.id)).toEqual(["b"]);
    act(() => result.current.onQueryChange("zebra"));
    expect(result.current.rows).toEqual([]);
    expect(result.current.emptyMessage).toBe('No reviews mention "zebra".');
    act(() => {
      result.current.onQueryChange("");
      result.current.onRatingFilterChange(2);
    });
    expect(result.current.emptyMessage).toBe("No reviews match that filter.");
  });

  it("marks a review helpful and takes it back", () => {
    const { result } = render();
    act(() => result.current.onToggleHelpful("a"));
    expect(result.current.rows[0]).toMatchObject({ voted: true, helpfulCount: 3 });
    act(() => result.current.onToggleHelpful("a"));
    expect(result.current.rows[0]).toMatchObject({ voted: false, helpfulCount: 2 });
  });
});
