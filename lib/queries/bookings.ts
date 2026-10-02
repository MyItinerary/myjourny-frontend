"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { apiErrorMessage } from "@/lib/api-error";
import { useSession } from "@/lib/auth/session-store";

// Matches itin's BookingOut DTO (app/core/dto/booking.py).
export type Booking = {
  id: string;
  experience_id?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "expired";
  payment_status: "unpaid" | "paid" | "refunded" | "partial";
  requested_datetime?: string | null;
  party_size?: number | null;
  price_total?: string | null;
  currency?: string | null;
  url?: string | null;
  hold_expires_at?: string | null;
};

// What the customer should see for a booking after checkout.
export type BookingPaymentState =
  | "confirmed" // paid and confirmed
  | "processing" // waiting for the payment provider to confirm
  | "not_paid" // checkout failed, was abandoned, or the hold ran out
  | "under_review" // paid, but the date filled up: support will refund
  | "refunded";

export function bookingPaymentState(booking: Booking): BookingPaymentState {
  if (booking.payment_status === "refunded") return "refunded";
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
