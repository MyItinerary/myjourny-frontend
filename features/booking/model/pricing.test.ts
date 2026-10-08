import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useBookingQuote, useExperiencePricing } from "./pricing";

const selection = {
  experience_id: "exp-1",
  items: [{ experience_price_id: "t-1", quantity: 2 }],
  addons: [],
};

describe("useExperiencePricing", () => {
  it("loads tickets, add-ons and rules", async () => {
    server.use(
      http.get(apiUrl("/experiences/exp-1/pricing"), () =>
        HttpResponse.json({ currency: "NGN", prices: [{ id: "t-1" }], addons: [], rules: [] }),
      ),
    );
    const { result } = renderHookWithProviders(() => useExperiencePricing("exp-1"));
    await waitFor(() => expect(result.current.data?.prices).toHaveLength(1));
  });
});

describe("useBookingQuote", () => {
  it("posts the selection and returns the quote", async () => {
    let body: unknown = null;
    server.use(
      http.post(apiUrl("/bookings/quote"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ total: "10000.00", lines: [], promo_applied: false });
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingQuote(selection));
    await waitFor(() => expect(result.current.data?.total).toBe("10000.00"));
    expect(body).toEqual(selection);
  });

  it("doesn't quote without tickets", () => {
    const { result } = renderHookWithProviders(() => useBookingQuote(null));
    expect(result.current.fetchStatus).toBe("idle");
  });
});
