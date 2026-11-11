import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useGuideBookings } from "./guide-bookings-api";

describe("useGuideBookings", () => {
  it("loads the guide's bookings from itin", async () => {
    server.use(http.get(apiUrl("/bookings/guide"), () => HttpResponse.json([{ id: "b1", status: "confirmed", payment_status: "paid" }])));
    const { result } = renderHookWithProviders(() => useGuideBookings(true));
    await waitFor(() => expect(result.current.data).toEqual([{ id: "b1", status: "confirmed", payment_status: "paid" }]));
  });

  it("asks nothing until it is enabled", () => {
    const { result } = renderHookWithProviders(() => useGuideBookings(false));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
