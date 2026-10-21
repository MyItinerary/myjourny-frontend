import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useExperienceReviewsViewModel } from "./use-experience-reviews-view-model";

const item = (id: string, author = "Ireti G.") => ({
  id,
  author_name: author,
  author_avatar_url: null,
  rating: 4,
  comment: "Great guide",
  created_at: "2026-10-12T10:00:00",
});

describe("useExperienceReviewsViewModel", () => {
  it("shows the average, the count and the reviews", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), () =>
        HttpResponse.json({ items: [item("a"), item("b", "Tunde")], total: 2, page: 1, limit: 6, rating: 4.25 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
    await waitFor(() => expect(result.current.reviews).toHaveLength(2));
    expect(result.current.rating).toBe("4.3");
    expect(result.current.countLabel).toBe("2 reviews");
    expect(result.current.reviews[1]).toMatchObject({ author: "Tunde", initial: "T", date: "12 Oct 2026" });
    expect(result.current.hasMore).toBe(false);
  });

  it("says one review, and offers more when there are more", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        return HttpResponse.json({ items: [item(`r-${page}`)], total: 2, page, limit: 1, rating: 5 });
      }),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    act(() => result.current.onShowMore());
    await waitFor(() => expect(result.current.reviews).toHaveLength(2));
    expect(result.current.hasMore).toBe(false);
  });

  it("has no rating or count before the first review", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), () =>
        HttpResponse.json({ items: [], total: 0, page: 1, limit: 6, rating: null }),
      ),
    );
    const { result } = renderHookWithProviders(() =>
      useExperienceReviewsViewModel("exp-1", { rating: null, review_count: 0 }),
    );
    await waitFor(() => expect(result.current.reviews).toEqual([]));
    expect(result.current.rating).toBeNull();
    expect(result.current.countLabel).toBeNull();
  });

  it("uses the experience's own rating while the reviews load", () => {
    const { result } = renderHookWithProviders(() =>
      useExperienceReviewsViewModel("exp-1", { rating: 4.8, review_count: 1 }),
    );
    expect(result.current.rating).toBe("4.8");
    expect(result.current.countLabel).toBe("1 review");
  });
});
