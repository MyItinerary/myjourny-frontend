import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { BookingOut, CreateBookingPayload } from "./booking.types";

/** POST /bookings/: creates the booking and (unless the experience books
 * elsewhere) a Paystack/Stripe checkout, returning its `url`. platform "web"
 * sends the payment provider back to this site rather than the app. */
export function useCreateBooking() {
  return useMutation({
    mutationFn: async ({ idempotencyKey, ...payload }: CreateBookingPayload) => {
      const { data } = await apiClient.post<BookingOut>(
        "/bookings/",
        { ...payload, payment_flow: "checkout", platform: "web" },
        { headers: { "Idempotency-Key": idempotencyKey } },
      );
      return data;
    },
  });
}
