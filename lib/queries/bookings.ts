"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

export type Booking = {
  id: string;
  user_id?: string;
  guide_id?: string | null;
  experience_id?: string | null;
  experience_title?: string | null;
  experience_cover_image_url?: string | null;
  experience_price_id?: string | null;
  trip_id?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "expired";
  payment_status: "unpaid" | "paid" | "refunded" | "partial";
  payout_status?: string | null;
  paystack_reference?: string | null;
  requested_datetime?: string | null;
  duration_hours?: string | null;
  party_size?: number | null;
  price_total?: string | null;
  subtotal_amount?: string | null;
  discount_amount?: string | null;
  checkout_fee_amount?: string | null;
  refunded_amount?: string | null;
  days?: number | null;
  currency?: string | null;
  line_items?: {
    kind?: string;
    label: string;
    quantity: number;
    unit_amount?: string;
    amount: string;
  }[];
  url?: string | null;
  hold_expires_at?: string | null;
  // The experience's cancellation policy as shown when this was booked.
  cancellation_policy_snapshot?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// A cancellation request (itin's RefundRequestOut). Support decides the
// refund under the booking's policy; nothing is refunded automatically.
export type CancellationRequest = {
  id: string;
  kind: string;
  status: "open" | "resolved";
  reason?: string | null;
  refund_amount?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

// What the customer should see for a booking after checkout.
export type BookingPaymentState =
  | "cancelled" // cancelled after payment; any refund was decided by support
  | "confirmed" // paid and confirmed
  | "processing" // waiting for the payment provider to confirm
  | "not_paid" // checkout failed, was abandoned, or the hold ran out
  | "under_review" // paid, but the date filled up: support will refund
  | "refunded";

export function bookingPaymentState(booking: Booking): BookingPaymentState {
  if (booking.payment_status === "refunded") return "refunded";
  if (booking.status === "cancelled" && booking.payment_status !== "unpaid") return "cancelled";
  if (booking.payment_status === "paid" || booking.payment_status === "partial") {
    return booking.status === "confirmed" || booking.status === "completed"
      ? "confirmed"
      : "under_review";
  }
  return booking.status === "pending" ? "processing" : "not_paid";
}

const POLL_INTERVAL_MS = 3_000;
// Payment providers usually confirm within seconds; after this the page
// stops polling and tells the customer we'll email them.
export const PROCESSING_TIMEOUT_MS = 90_000;

// GET /bookings/{id}. While the payment is still processing, polls until the
// provider's webhook confirms it or `pollUntil` (a timestamp) passes.
export function useBooking(bookingId: string, { pollUntil }: { pollUntil?: number } = {}) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: async () => {
      const { data } = await apiClient.get<Booking>(`/bookings/${bookingId}`);
      return data;
    },
    enabled: !!user && !!bookingId,
    refetchInterval: (query) => {
      const booking = query.state.data;
      if (!pollUntil || !booking || bookingPaymentState(booking) !== "processing") return false;
      return Date.now() < pollUntil ? POLL_INTERVAL_MS : false;
    },
  });
}

// POST /bookings/{id}/retry-payment — opens a fresh checkout for the same
// booking (re-checking seats if the hold ran out) and returns its URL.
export function useRetryBookingPayment() {
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await apiClient.post<Booking>(`/bookings/${bookingId}/retry-payment`, {
        payment_flow: "checkout",
        platform: "web",
      });
      return data;
    },
    onSuccess: (booking) => {
      if (booking.url) window.location.href = booking.url;
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't restart the payment. Please try again.")),
  });
}

// GET /bookings/{id}/cancellation — the latest cancellation request, if any.
export function useCancellationRequest(bookingId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["bookings", bookingId, "cancellation"],
    queryFn: async () => {
      const { data } = await apiClient.get<CancellationRequest | null>(
        `/bookings/${bookingId}/cancellation`
      );
      return data;
    },
    enabled: !!user && !!bookingId,
  });
}

// POST /bookings/{id}/cancellation. Unpaid bookings are cancelled straight
// away; paid ones go to support, who decide the refund.
export function useRequestCancellation(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await apiClient.post<{
        booking_status: string;
        request: CancellationRequest | null;
      }>(`/bookings/${bookingId}/cancellation`, { reason });
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        data.request
          ? "Cancellation requested. We'll email you once support has reviewed it."
          : "Booking cancelled."
      );
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Couldn't send your cancellation request. Please try again.")),
  });
}

// GET /bookings/ — list all bookings for the authenticated user.
export function useUserBookings(status?: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: ["bookings", "user-list", status],
    queryFn: async () => {
      const { data } = await apiClient.get<Booking[]>("/bookings/", {
        params: status ? { status } : undefined,
      });
      return data;
    },
    enabled: !!user,
  });
}

export type MyExperiencesTab = "upcoming" | "past" | "cancelled";

export type MyBookingsResponse = {
  items: Booking[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
};

// GET /bookings/me?tab=...&limit=...&offset=...
// Returns the logged-in traveller's bookings for one tab, one page at a time.
export function useMyBookings(tab: MyExperiencesTab, limit = 12) {
  const { user } = useSession();
  return useInfiniteQuery({
    queryKey: ["bookings", "me", tab],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await apiClient.get<MyBookingsResponse>("/bookings/me", {
        params: {
          tab,
          limit,
          offset: pageParam,
        },
      });
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (last) =>
      last.has_more ? last.offset + last.items.length : undefined,
    enabled: !!user,
  });
}


