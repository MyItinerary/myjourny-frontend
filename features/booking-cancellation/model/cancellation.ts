import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { getTokens } from "@/lib/auth/session-store";

import type {
  CancellationOutcome,
  CancellationRequest,
  CancellationResult,
  RefundEstimate,
} from "./cancellation.types";

/** GET /bookings/{id}/cancellation: the latest cancellation request, if any. */
export function useCancellationRequest(bookingId: string, signedIn: boolean) {
  return useQuery({
    queryKey: ["bookings", bookingId, "cancellation"],
    enabled: !!bookingId && (signedIn || !!getTokens().accessToken),
    queryFn: async () =>
      (await apiClient.get<CancellationRequest | null>(`/bookings/${bookingId}/cancellation`)).data,
  });
}

function isEstimate(data: unknown): data is RefundEstimate {
  return !!data && typeof data === "object" && !Array.isArray(data) && "paid" in data;
}

/** GET /bookings/{id}/refund-estimate: what cancelling now would get back. An
 * API without the endpoint gives no estimate rather than an error. */
export function useRefundEstimate(bookingId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["bookings", bookingId, "refund-estimate"],
    enabled: !!bookingId && enabled,
    retry: false,
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<RefundEstimate>(`/bookings/${bookingId}/refund-estimate`);
        return isEstimate(data) ? data : null;
      } catch {
        return null;
      }
    },
  });
}

/** POST /bookings/{id}/cancellation. Unpaid bookings are cancelled straight
 * away; paid ones go to support, who decide the refund. */
export function useRequestCancellation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) =>
      (await apiClient.post<CancellationResult>(`/bookings/${bookingId}/cancellation`, { reason })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] }),
  });
}

/** itin sends UTC without an offset; read it as UTC. */
export function parseUtc(value: string): Date {
  return new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(value) ? value : `${value}Z`);
}

/** "Fri 4 December, 9:00am", in the session's time zone (as the booking card). */
export function cutoffLabel(date: Date, timeZone?: string): string {
  const day = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", timeZone });
  const time = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .replace(/\s/g, "")
    .toLowerCase();
  return `${day}, ${time}`;
}

export function formatMoney(amount: string | number | null | undefined, currency: string): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, minimumFractionDigits: 2 }).format(
    Number(amount ?? 0),
  );
}

export type EstimateSummary = {
  /** The headline, e.g. "Full refund until Fri 4 December, 9:00am". */
  title: string;
  /** What cancelling now gets back, when the policy says. */
  detail: string | null;
  /** Rows for the breakdown: paid, already refunded, refund. */
  breakdown: { label: string; value: string }[];
};

/** What the customer is told before asking to cancel. */
export function estimateSummary(
  estimate: RefundEstimate,
  currency: string,
  timeZone?: string,
): EstimateSummary {
  const money = (v: string | number | null | undefined) => formatMoney(v, currency);
  const deadline = estimate.deadline ? cutoffLabel(parseUtc(estimate.deadline), timeZone) : null;
  const title =
    estimate.policy === "non_refundable"
      ? "Non-refundable"
      : estimate.policy === "full_refund_until" && deadline
        ? `Full refund until ${deadline}`
        : "Refund decided by our support team";

  if (estimate.eligible == null || estimate.amount == null) {
    return {
      title,
      detail: "Support will check your request against the policy below and decide any refund.",
      breakdown: [],
    };
  }
  const breakdown = [{ label: "Paid", value: money(estimate.paid) }];
  if (Number(estimate.already_refunded) > 0) {
    breakdown.push({ label: "Already refunded", value: `−${money(estimate.already_refunded)}` });
  }
  breakdown.push({ label: "Estimated refund", value: money(estimate.amount) });
  return {
    title,
    detail: estimate.eligible
      ? `If you cancel now, you should get ${money(estimate.amount)} back. Support confirms it when they review your request.`
      : estimate.policy === "non_refundable"
        ? "This booking can't be refunded if you cancel."
        : "The full refund window has passed, so cancelling now gets no refund.",
    breakdown,
  };
}

/** A request's outcome; an API without `outcome` only says open or resolved. */
export function requestOutcome(request: CancellationRequest): CancellationOutcome | "resolved" {
  if (request.outcome) return request.outcome;
  return request.status === "open" ? "pending" : "resolved";
}

export type OutcomeSummary = { title: string; body: string; tone: "neutral" | "good" | "bad" };

/** What the customer sees once they've asked. */
export function outcomeSummary(request: CancellationRequest, currency: string): OutcomeSummary {
  const sent = parseUtc(request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  switch (requestOutcome(request)) {
    case "pending":
      return {
        title: "Cancellation requested",
        body: `Sent ${sent}. Support is reviewing it, and we'll email you the outcome.`,
        tone: "neutral",
      };
    case "refunded":
      return {
        title: "Refund issued",
        body: `We've refunded ${formatMoney(request.refund_amount, currency)}. It can take a few working days to reach you.`,
        tone: "good",
      };
    case "approved":
      return {
        title: "Booking cancelled",
        body: "Support cancelled this booking. No refund was due under its cancellation policy.",
        tone: "neutral",
      };
    case "rejected":
      return {
        title: "Cancellation request declined",
        body: "Support reviewed your request against the cancellation policy and couldn't approve it, so your booking is still on.",
        tone: "bad",
      };
    default:
      return {
        title: "Cancellation request reviewed",
        body: "Support has reviewed your request. Check your email for the outcome.",
        tone: "neutral",
      };
  }
}
