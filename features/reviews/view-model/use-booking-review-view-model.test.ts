import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useBookingReviewViewModel } from "./use-booking-review-view-model";

const completed = { id: "b-1", status: "completed", experience_id: "exp-1" };
const later = new Date(Date.now() + 7 * 86_400_000).toISOString();
const earlier = new Date(Date.now() - 86_400_000).toISOString();

const posted = (editableUntil = later) => ({
  id: "r-1",
  booking_id: "b-1",
  experience_id: "exp-1",
  rating: 4,
  comment: "Good",
  is_hidden: false,
  editable_until: editableUntil,
  created_at: "2026-10-12T10:00:00",
  updated_at: "2026-10-12T10:00:00",
});

function reviewStatus(body: Record<string, unknown>) {
  server.use(http.get(apiUrl("/bookings/b-1/review"), () => HttpResponse.json(body)));
}

describe("useBookingReviewViewModel", () => {
  it("shows nothing for a booking that isn't completed, without asking the API", () => {
    let asked = false;
    server.use(
      http.get(apiUrl("/bookings/b-1/review"), () => {
        asked = true;
        return HttpResponse.json({ can_review: false });
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useBookingReviewViewModel({ ...completed, status: "confirmed" }),
    );
    expect(result.current.mode).toBe("hidden");
    expect(asked).toBe(false);
  });

  it("asks a completed booking for a review and posts it", async () => {
    reviewStatus({ can_review: true });
    let body: unknown;
    server.use(
      http.post(apiUrl("/bookings/b-1/review"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(posted(), { status: 201 });
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingReviewViewModel(completed));
    await waitFor(() => expect(result.current.mode).toBe("form"));
    if (result.current.mode !== "form") throw new Error("expected the form");
    expect(result.current.canSubmit).toBe(false);

    act(() => {
      if (result.current.mode === "form") result.current.onRate(5);
    });
    act(() => {
      if (result.current.mode === "form") result.current.onComment("Loved the canoe ride");
    });
    expect(result.current.mode === "form" && result.current.canSubmit).toBe(true);

    act(() => {
      if (result.current.mode === "form") result.current.onSubmit();
    });
    await waitFor(() => expect(body).toEqual({ rating: 5, comment: "Loved the canoe ride" }));
  });

  it("shows the review already left, editable within 14 days", async () => {
    reviewStatus({ can_review: false, review: posted() });
    const { result } = renderHookWithProviders(() => useBookingReviewViewModel(completed));
    await waitFor(() => expect(result.current.mode).toBe("posted"));
    if (result.current.mode !== "posted") throw new Error("expected the review");
    expect(result.current).toMatchObject({ rating: 4, comment: "Good", date: "12 Oct 2026" });

    act(() => {
      if (result.current.mode === "posted") result.current.onEdit?.();
    });
    expect(result.current).toMatchObject({ mode: "form", editing: true, rating: 4, comment: "Good" });
  });

  it("can't edit after the edit window", async () => {
    reviewStatus({ can_review: false, review: posted(earlier) });
    const { result } = renderHookWithProviders(() => useBookingReviewViewModel(completed));
    await waitFor(() => expect(result.current.mode).toBe("posted"));
    expect(result.current.mode === "posted" && result.current.onEdit).toBeNull();
  });

  it("shows nothing when the API says it can't be reviewed", async () => {
    let asked = false;
    server.use(
      http.get(apiUrl("/bookings/b-1/review"), () => {
        asked = true;
        return HttpResponse.json({ can_review: false, reason: "Only the traveller who booked can review it" });
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingReviewViewModel(completed));
    await waitFor(() => expect(asked).toBe(true));
    expect(result.current.mode).toBe("hidden");
  });
});
