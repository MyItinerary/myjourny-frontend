import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useHostEarnings } from "./earnings-data";

describe("useHostEarnings", () => {
  it("loads ledger totals and booking lines for the signed-in guide", async () => {
    const response = {
      totals: [{ currency: "NGN", earned: "48000.00", pending: "15000.00", paid_out: "33000.00" }],
      bookings: [{
        booking_id: "booking-1",
        experience_title: "Lagos food walk",
        session_at: "2026-11-29T15:00:00",
        currency: "NGN",
        earned: "30000.00",
        pending: "0.00",
        paid_out: "30000.00",
        payout_status: "paid",
      }],
    };
    server.use(http.get(apiUrl("/guide/earnings"), () => HttpResponse.json(response)));
    const { result } = renderHookWithProviders(() => useHostEarnings());

    await waitFor(() => expect(result.current.data).toEqual(response));
    expect(result.current.data?.bookings[0].booking_id).toBe("booking-1");
  });

  it("does not request earnings while disabled", () => {
    const { result } = renderHookWithProviders(() => useHostEarnings(false));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
