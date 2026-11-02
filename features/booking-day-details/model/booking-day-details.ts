import type { BookingDayDetails, BookingDayDetailsSource } from "./booking-day-details.types";

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Only https links from the API are used as hrefs. */
function safeLink(url: string | null | undefined): string | null {
  return url && /^https:\/\//i.test(url) ? url : null;
}

export function toBookingDayDetails(booking: BookingDayDetailsSource): BookingDayDetails {
  const point = booking.meeting_point ?? null;
  const hasPin = point?.latitude != null && point?.longitude != null;
  const area = [clean(point?.city), clean(point?.country)].filter(Boolean).join(", ");
  const phone = clean(booking.host_phone);
  return {
    meetingInstructions: clean(point?.instructions),
    meetingArea: area || null,
    mapsUrl: hasPin
      ? `https://www.google.com/maps/dir/?api=1&destination=${point!.latitude},${point!.longitude}`
      : null,
    whatToBring: clean(booking.what_to_bring),
    hostPhone: phone,
    hostPhoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
    calendarUrl: safeLink(booking.calendar_url),
    receiptUrl: safeLink(booking.receipt_url),
  };
}

export function hasMeetingDetails(details: BookingDayDetails): boolean {
  return Boolean(
    details.meetingInstructions || details.mapsUrl || details.whatToBring || details.hostPhone,
  );
}
