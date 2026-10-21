import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { isEditable, reviewDate, useBookingReview, useExperienceReviews, useSaveReview } from "./reviews";
import type { MyReview } from "./reviews.types";

const review = (id: string) => ({
  id,
  author_name: "Ireti G.",
  rating: 5,
  comment: "Lovely",
  created_at: "2026-10-12T10:00:00",
});

const mine: MyReview = {
  id: "r-1",
  booking_id: "b-1",
  experience_id: "exp-1",
  rating: 4,
  comment: "Good",
  is_hidden: false,
  editable_until: "2026-10-26T10:00:00",
  created_at: "2026-10-12T10:00:00",
  updated_at: "2026-10-12T10:00:00",
};

describe("useExperienceReviews", () => {
  it("loads reviews a page at a time until there are no more", async () => {
    const pages: string[] = [];
    server.use(
      http.get(apiUrl("/experiences/exp-1/reviews"), ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page"));
        pages.push(String(page));
        return HttpResponse.json({
          items: page === 1 ? [review("a"), review("b")] : [review("c")],
          total: 3,
          page,
          limit: 2,
          rating: 4.7,
        });
      }),
    );
    const { result } = renderHookWithProviders(() => useExperienceReviews("exp-1"));
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(pages).toEqual(["1", "2"]);
  });
});

describe("useBookingReview", () => {
  it("doesn't ask until the booking can be reviewed", () => {
    const { result } = renderHookWithProviders(() => useBookingReview("b-1", false));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSaveReview", () => {
  it("posts a new review with a blank comment sent as empty", async () => {
    let body: unknown;
    server.use(
      http.post(apiUrl("/bookings/b-1/review"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(mine, { status: 201 });
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveReview("b-1", "exp-1"));
    await act(() => result.current.mutateAsync({ input: { rating: 5, comment: "   " } }));
    expect(body).toEqual({ rating: 5, comment: null });
  });

  it("edits an existing review", async () => {
    let body: unknown;
    server.use(
      http.patch(apiUrl("/reviews/r-1"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...mine, rating: 3 });
      }),
    );
    const { result } = renderHookWithProviders(() => useSaveReview("b-1", "exp-1"));
    await act(() => result.current.mutateAsync({ input: { rating: 3, comment: " Fine " }, reviewId: "r-1" }));
    expect(body).toEqual({ rating: 3, comment: "Fine" });
  });
});

describe("helpers", () => {
  it("formats the review date", () => {
    expect(reviewDate("2026-10-12T10:00:00")).toBe("12 Oct 2026");
  });

  it("allows edits only until the edit window closes", () => {
    expect(isEditable(mine, new Date("2026-10-20T10:00:00"))).toBe(true);
    expect(isEditable(mine, new Date("2026-10-27T10:00:00"))).toBe(false);
  });
});
