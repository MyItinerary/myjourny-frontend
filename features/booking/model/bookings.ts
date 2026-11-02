import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { BookingOut, CreateBookingPayload } from "./booking.types";
import { sessionsQueryKey } from "./sessions";

/** POST /bookings/: creates the booking and (unless the experience books
 * elsewhere) a Paystack/Stripe checkout, returning its `url`. platform "web"
 * sends the payment provider back to this site rather than the app. */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idempotencyKey, ...payload }: CreateBookingPayload) => {
      const { data } = await apiClient.post<BookingOut>(
        "/bookings/",
        { ...payload, payment_flow: "checkout", platform: "web" },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
      return data;
    },
    // 409: the session filled up or stopped running. Whoever shows sessions
    // next loads the seats left now.
    onError: (error, payload) => {
      if ((error as { response?: { status?: number } })?.response?.status === 409) {
        void queryClient.invalidateQueries({ queryKey: sessionsQueryKey(payload.experience_id) });
      }
    },
  });
}
