import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useCreateBooking } from "./bookings";

describe("useCreateBooking", () => {
  it("creates a web checkout booking with the idempotency key as a header", async () => {
    let body: Record<string, unknown> | null = null;
    let key: string | null = null;
    server.use(
      http.post(apiUrl("/bookings/"), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        key = request.headers.get("Idempotency-Key");
        return HttpResponse.json({ id: "b-1", status: "pending", payment_status: "unpaid", url: "https://pay" });
      }),
    );
    const { result } = renderHookWithProviders(() => useCreateBooking());

    act(() => {
      result.current.mutate({
        experience_id: "exp-1",
        items: [{ experience_price_id: "t-1", quantity: 1 }],
        addons: [],
        guide_id: "g-1",
        idempotencyKey: "key-1",
      });
    });

    await waitFor(() => expect(result.current.data?.url).toBe("https://pay"));
    expect(key).toBe("key-1");
    expect(body).toMatchObject({ guide_id: "g-1", payment_flow: "checkout", platform: "web" });
    expect(body).not.toHaveProperty("idempotencyKey");
  });
});
