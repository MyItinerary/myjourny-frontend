import { formatPrice } from "@/features/booking";
import { formatBookingDates } from "@/lib/dates";
import type { Booking } from "@/lib/queries/bookings";
import { type ExperienceDetail, useExperienceDetail } from "@/lib/queries/experiences";

import type { BookingConfirmation } from "./booking-confirmation.types";
import { googleCalendarUrl } from "./calendar";

export function buildBookingConfirmation(booking: Booking, experience?: ExperienceDetail): BookingConfirmation {
  const title = experience?.title ?? "Your experience";
  const guests = booking.party_size ?? 1;
  return {
    title,
    imageUrl: experience?.cover_image_url ?? experience?.images?.[0] ?? null,
    dateLabel: formatBookingDates(booking.requested_datetime),
    guestsLabel: `${guests} guest${guests === 1 ? "" : "s"}`,
    totalLabel:
      booking.price_total != null ? formatPrice(Number(booking.price_total), booking.currency ?? "NGN") : null,
    viewHref: `/bookings/${booking.id}`,
    calendarHref: googleCalendarUrl({
      title,
      startsAt: booking.requested_datetime,
      durationMinutes: experience?.duration_minutes,
    }),
  };
}

/** The confirmed booking's experience, shaped for the "You're going!" page. */
export function useBookingConfirmation(booking: Booking): BookingConfirmation {
  const { data: experience } = useExperienceDetail(booking.experience_id ?? "");
  return buildBookingConfirmation(booking, experience);
}
