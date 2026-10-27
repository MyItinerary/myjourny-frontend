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
    expect(result.current.reviews[1]).toMatchObject({ author: "Tunde", initials: "T", date: "October 2026" });
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

  it("shows the new-listing state when there are no reviews", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), () =>
        HttpResponse.json({ items: [], total: 0, page: 1, limit: 6, rating: null }),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
    expect(result.current.display).toBe("loading");
    await waitFor(() => expect(result.current.display).toBe("new"));
  });

  it("shows the error state and retries", async () => {
    let calls = 0;
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), () => {
        calls += 1;
        return HttpResponse.json({ detail: "boom" }, { status: 500 });
      }),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
    await waitFor(() => expect(result.current.display).toBe("error"));
    const before = calls;
    act(() => result.current.onRetry());
    await waitFor(() => expect(calls).toBeGreaterThan(before));
  });

  it("fills an empty experience with sample reviews only in preview", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), () =>
        HttpResponse.json({ items: [], total: 0, page: 1, limit: 6, rating: null }),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1", null, { preview: true }));
    await waitFor(() => expect(result.current.display).toBe("populated"));
    expect(result.current.rating).toBe("4.8");
    expect(result.current.breakdown.map((row) => row.label)).toEqual(["Host", "Value", "Organisation"]);
    expect(result.current.summary).toBeTruthy();
  });

  describe("search, sort, filter and votes", () => {
    const setup = async () => {
      server.use(
        http.get(apiUrl("/experiences/exp-1/reviews"), () =>
          HttpResponse.json({
            items: [
              {
                ...item("a", "Ngozi A."),
                rating: 5,
                comment: "Loved the kayak",
                created_at: "2026-08-01T00:00:00",
                helpful_count: 0,
                host_reply: { author: "Tunde, host", text: "Thank you!" },
              },
              { ...item("b", "Bayo K."), rating: 3, comment: "Cold breakfast", created_at: "2026-09-01T00:00:00" },
              { ...item("c", "Hauwa M."), rating: 5, comment: "x".repeat(300), created_at: "2026-07-01T00:00:00" },
              { ...item("d", "Chidi O."), rating: 4, comment: "Good value", created_at: "2026-06-01T00:00:00" },
              { ...item("e", "Ireti G."), rating: 4, comment: "Lovely", created_at: "2026-05-01T00:00:00" },
            ],
            total: 5,
            page: 1,
            limit: 6,
            rating: 4.2,
          }),
        ),
      );
      const hook = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
      await waitFor(() => expect(hook.result.current.reviews).toHaveLength(5));
      return hook.result;
    };

    it("searches, and says when nothing matches", async () => {
      const result = await setup();
      act(() => result.current.onQueryChange("kayak"));
      expect(result.current.reviews.map((r) => r.id)).toEqual(["a"]);
      act(() => result.current.onQueryChange("zzz"));
      expect(result.current.display).toBe("noResults");
      act(() => result.current.onClearQuery());
      expect(result.current.reviews).toHaveLength(5);
    });

    it("sorts and closes the menu", async () => {
      const result = await setup();
      act(() => result.current.onToggleSort());
      expect(result.current.sortOpen).toBe(true);
      act(() => result.current.onSortChange("newest"));
      expect(result.current.sortOpen).toBe(false);
      expect(result.current.sortLabel).toBe("Newest");
      expect(result.current.reviews[0].id).toBe("b");
    });

    it("filters by rating and clears the filters", async () => {
      const result = await setup();
      act(() => result.current.onRatingFilter(4));
      expect(result.current.reviews.map((r) => r.id)).toEqual(["d", "e"]);
      expect(result.current.activeFilterCount).toBe(1);
      act(() => result.current.onClearFilters());
      expect(result.current.activeFilterCount).toBe(0);
      expect(result.current.reviews).toHaveLength(5);
    });

    it("opens one panel at a time", async () => {
      const result = await setup();
      act(() => result.current.onToggleFilter());
      expect(result.current.filterOpen).toBe(true);
      act(() => result.current.onToggleSort());
      expect(result.current.filterOpen).toBe(false);
      expect(result.current.sortOpen).toBe(true);
    });

    it("counts a helpful vote and takes it back", async () => {
      const result = await setup();
      act(() => result.current.onToggleHelpful("a"));
      expect(result.current.reviews[0]).toMatchObject({ voted: true, helpfulCount: 1 });
      act(() => result.current.onToggleHelpful("a"));
      expect(result.current.reviews[0]).toMatchObject({ voted: false, helpfulCount: 0 });
    });


    it("takes the host's initials from their name, not the 'host' label", async () => {
      const result = await setup();
      expect(result.current.reviews.find((r) => r.id === "a")?.hostReply?.initials).toBe("T");
    });


    it("closes the sort menu", async () => {
      const result = await setup();
      act(() => result.current.onToggleSort());
      act(() => result.current.onCloseSort());
      expect(result.current.sortOpen).toBe(false);
    });
    it("expands a long review", async () => {
      const result = await setup();
      const long = () => result.current.reviews.find((r) => r.id === "c");
      expect(long()).toMatchObject({ long: true, clamped: true });
      act(() => result.current.onToggleExpanded("c"));
      expect(long()?.clamped).toBe(false);
    });

    it("marks fewer than five reviews as early", async () => {
      server.use(
        http.get(apiUrl("/experiences/exp-1/reviews"), () =>
          HttpResponse.json({ items: [item("a")], total: 1, page: 1, limit: 6, rating: 4 }),
        ),
      );
      const { result } = renderHookWithProviders(() => useExperienceReviewsViewModel("exp-1"));
      await waitFor(() => expect(result.current.display).toBe("early"));
    });
  });

  it("uses the experience's own rating while the reviews load", () => {
    const { result } = renderHookWithProviders(() =>
      useExperienceReviewsViewModel("exp-1", { rating: 4.8, review_count: 1 }),
    );
    expect(result.current.rating).toBe("4.8");
    expect(result.current.countLabel).toBe("1 review");
  });
});
