import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import {
  cutoffLabel,
  estimateSummary,
  outcomeSummary,
  parseUtc,
  requestOutcome,
  useRefundEstimate,
} from "./cancellation";
import type { CancellationRequest, RefundEstimate } from "./cancellation.types";

const estimate = (overrides: Partial<RefundEstimate> = {}): RefundEstimate => ({
  policy: "full_refund_until",
  eligible: true,
  amount: "33000.00",
  deadline: "2030-06-01T08:00:00",
  paid: "33000.00",
  already_refunded: "0.00",
  ...overrides,
});

const request = (overrides: Partial<CancellationRequest> = {}): CancellationRequest => ({
  id: "r-1",
  kind: "customer_cancellation",
  status: "open",
  created_at: "2030-05-20T10:00:00",
  ...overrides,
});

describe("dates", () => {
  it("reads itin's offset-less times as UTC and keeps ones with an offset", () => {
    expect(parseUtc("2030-06-01T08:00:00").toISOString()).toBe("2030-06-01T08:00:00.000Z");
    expect(parseUtc("2030-06-01T08:00:00+01:00").toISOString()).toBe("2030-06-01T07:00:00.000Z");
  });

  it("labels the cutoff in the session's time zone", () => {
    expect(cutoffLabel(parseUtc("2030-06-01T08:00:00"), "Africa/Lagos")).toBe("Sat 1 June, 9:00am");
  });
});

describe("estimateSummary", () => {
  it("promises the full refund before the cutoff, with the breakdown", () => {
    const summary = estimateSummary(estimate(), "NGN", "Africa/Lagos");

    expect(summary.title).toBe("Full refund until Sat 1 June, 9:00am");
    expect(summary.detail).toContain("you should get ₦33,000.00 back");
    expect(summary.breakdown).toEqual([
      { label: "Paid", value: "₦33,000.00" },
      { label: "Estimated refund", value: "₦33,000.00" },
    ]);
  });

  it("takes off what was already refunded", () => {
    const summary = estimateSummary(estimate({ amount: "30000", already_refunded: "3000" }), "NGN");

    expect(summary.breakdown.map((r) => r.label)).toEqual(["Paid", "Already refunded", "Estimated refund"]);
    expect(summary.breakdown[1].value).toBe("−₦3,000.00");
  });

  it("says when the window has passed", () => {
    const summary = estimateSummary(estimate({ eligible: false, amount: "0" }), "NGN");

    expect(summary.detail).toBe("The full refund window has passed, so cancelling now gets no refund.");
  });

  it("says a non-refundable booking gets nothing", () => {
    const summary = estimateSummary(
      estimate({ policy: "non_refundable", eligible: false, amount: "0", deadline: null }),
      "NGN",
    );

    expect(summary.title).toBe("Non-refundable");
    expect(summary.detail).toBe("This booking can't be refunded if you cancel.");
  });

  it("leaves a custom policy to support without guessing an amount", () => {
    const summary = estimateSummary(estimate({ policy: "custom", eligible: null, amount: null }), "NGN");

    expect(summary.title).toBe("Refund decided by our support team");
    expect(summary.breakdown).toEqual([]);
  });
});

describe("outcomes", () => {
  it("falls back to the status when the API has no outcome", () => {
    expect(requestOutcome(request())).toBe("pending");
    expect(requestOutcome(request({ status: "resolved" }))).toBe("resolved");
    expect(requestOutcome(request({ status: "resolved", outcome: "rejected" }))).toBe("rejected");
  });

  it("describes each outcome", () => {
    expect(outcomeSummary(request(), "NGN").title).toBe("Cancellation requested");
    expect(
      outcomeSummary(request({ status: "resolved", outcome: "refunded", refund_amount: "5000" }), "NGN").body,
    ).toContain("₦5,000.00");
    expect(outcomeSummary(request({ status: "resolved", outcome: "approved" }), "NGN").title).toBe(
      "Booking cancelled",
    );
    expect(outcomeSummary(request({ status: "resolved", outcome: "rejected" }), "NGN")).toMatchObject({
      title: "Cancellation request declined",
      tone: "bad",
    });
    expect(outcomeSummary(request({ status: "resolved" }), "NGN").title).toBe("Cancellation request reviewed");
  });
});

describe("useRefundEstimate", () => {
  it("gives no estimate when the API doesn't have the endpoint yet", async () => {
    server.use(http.get(apiUrl("/bookings/b-1/refund-estimate"), () => new HttpResponse(null, { status: 404 })));

    const { result } = renderHookWithProviders(() => useRefundEstimate("b-1", true));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("ignores a response that isn't an estimate", async () => {
    server.use(http.get(apiUrl("/bookings/b-1/refund-estimate"), () => HttpResponse.json([])));

    const { result } = renderHookWithProviders(() => useRefundEstimate("b-1", true));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
