import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useGuideBookings } from "./guide-bookings-api";

describe("useGuideBookings", () => {
  it("loads the guide's bookings a page at a time", async () => {
    const requestedPages: string[] = [];
    server.use(http.get(apiUrl("/bookings/guide"), ({ request }) => {
      const page = new URL(request.url).searchParams.get("page") ?? "1";
      requestedPages.push(page);
      return HttpResponse.json({
        items: [{ id: page === "1" ? "b1" : "b2", status: "confirmed", payment_status: "paid" }],
        total: 2,
        limit: 1,
        page: Number(page),
        has_more: page === "1",
      });
    }));
    const { result } = renderHookWithProviders(() => useGuideBookings(true));
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(1));
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());

    expect(result.current.data?.pages.map((page) => page.items[0].id)).toEqual(["b1", "b2"]);
    expect(result.current.hasNextPage).toBe(false);
    expect(requestedPages).toEqual(["1", "2"]);
  });

  it("asks nothing until it is enabled", () => {
    const { result } = renderHookWithProviders(() => useGuideBookings(false));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
