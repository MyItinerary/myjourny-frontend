import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useBookingCancellationViewModel } from "./use-booking-cancellation-view-model";

const booking = {
  id: "b-1",
  status: "confirmed",
  payment_status: "paid",
  currency: "NGN",
  session_timezone: "Africa/Lagos",
  cancellation_policy_snapshot: "Full refund up to 48 hours before.",
};

type Body = Record<string, unknown> | null;

function api({ request = null as Body, estimate = null as Body } = {}) {
  server.use(
    http.get(apiUrl("/bookings/b-1/cancellation"), () => HttpResponse.json(request)),
    http.get(apiUrl("/bookings/b-1/refund-estimate"), () => HttpResponse.json(estimate)),
  );
}

describe("useBookingCancellationViewModel", () => {
  it("fetches nothing before the booking loads", () => {
    let asked = false;
    server.use(
      http.get(apiUrl("/bookings/:id/cancellation"), () => {
        asked = true;
        return HttpResponse.json(null);
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(undefined, true));

    expect(result.current.canRequest).toBe(false);
    expect(asked).toBe(false);
  });

  it("shows the estimate before a paid booking asks to cancel", async () => {
    api({
      estimate: {
        policy: "full_refund_until",
        eligible: true,
        amount: "15000.00",
        deadline: "2030-06-01T08:00:00",
        paid: "15000.00",
        already_refunded: "0.00",
      },
    });
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(booking, true));

    await waitFor(() => expect(result.current.estimate).not.toBeNull());
    expect(result.current.estimate?.title).toBe("Full refund until Sat 1 June, 9:00am");
    expect(result.current.policyText).toBe("Full refund up to 48 hours before.");
    expect(result.current.canRequest).toBe(true);
    expect(result.current.outcome).toBeNull();
  });

  it("doesn't ask for an estimate on an unpaid booking", async () => {
    let asked = false;
    server.use(
      http.get(apiUrl("/bookings/b-1/cancellation"), () => HttpResponse.json(null)),
      http.get(apiUrl("/bookings/b-1/refund-estimate"), () => {
        asked = true;
        return HttpResponse.json(null);
      }),
    );
    const { result } = renderHookWithProviders(() =>
      useBookingCancellationViewModel({ ...booking, payment_status: "unpaid" }, true),
    );

    await waitFor(() => expect(result.current.unpaid).toBe(true));
    expect(result.current.estimate).toBeNull();
    expect(asked).toBe(false);
  });

  it("shows a pending request and hides the form", async () => {
    api({ request: { id: "r-1", kind: "customer_cancellation", status: "open", created_at: "2030-05-20T10:00:00" } });
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(booking, true));

    await waitFor(() => expect(result.current.outcome?.title).toBe("Cancellation requested"));
    expect(result.current.canRequest).toBe(false);
    expect(result.current.estimate).toBeNull();
  });

  it("lets them ask again after a declined request", async () => {
    api({
      request: {
        id: "r-1",
        kind: "customer_cancellation",
        status: "resolved",
        outcome: "rejected",
        created_at: "2030-05-20T10:00:00",
      },
    });
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(booking, true));

    await waitFor(() => expect(result.current.outcome?.title).toBe("Cancellation request declined"));
    expect(result.current.canRequest).toBe(true);
    act(() => result.current.onOpenForm());
    expect(result.current.outcome).toBeNull();
  });

  it("sends the reason and closes the form", async () => {
    api();
    let body: unknown;
    server.use(
      http.post(apiUrl("/bookings/b-1/cancellation"), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          booking_status: "confirmed",
          request: { id: "r-1", kind: "customer_cancellation", status: "open", created_at: "2030-05-20T10:00:00" },
        });
      }),
    );
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(booking, true));

    act(() => result.current.onOpenForm());
    act(() => result.current.onReason("ab"));
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.onReason("  My plans changed "));
    expect(result.current.canSubmit).toBe(true);
    act(() => result.current.onSubmit());

    await waitFor(() => expect(result.current.formOpen).toBe(false));
    expect(body).toEqual({ reason: "My plans changed" });
    expect(result.current.reason).toBe("");
  });

  it("keeps the form open when sending fails", async () => {
    api();
    server.use(
      http.post(apiUrl("/bookings/b-1/cancellation"), () =>
        HttpResponse.json({ detail: "There's already an open request for this booking" }, { status: 409 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useBookingCancellationViewModel(booking, true));

    act(() => result.current.onOpenForm());
    act(() => result.current.onReason("My plans changed"));
    act(() => result.current.onSubmit());

    await waitFor(() => expect(result.current.sending).toBe(false));
    expect(result.current.formOpen).toBe(true);
  });
});
